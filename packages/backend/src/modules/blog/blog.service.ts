import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateBlogEntryDto } from './dto/create-blog-entry.dto';
import { UpdateBlogEntryDto } from './dto/update-blog-entry.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findPublished(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.blogEntry.findMany({
        where: { status: 'PUBLISHED' },
        skip,
        take: limit,
        include: { author: { select: { id: true, name: true } } },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.blogEntry.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return {
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.blogEntry.findMany({
        skip,
        take: limit,
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogEntry.count(),
    ]);

    return {
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const entry = await this.prisma.blogEntry.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true } } },
    });

    if (!entry) {
      throw new NotFoundException('Blog-Eintrag nicht gefunden');
    }

    return entry;
  }

  async create(dto: CreateBlogEntryDto, authorId: string) {
    const slug = dto.slug || this.generateSlug(dto.title);

    try {
      return await this.prisma.blogEntry.create({
        data: {
          title: dto.title,
          slug,
          excerpt: dto.excerpt,
          content: dto.content,
          authorId,
          status: 'DRAFT',
        },
        include: { author: { select: { id: true, name: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Ein Eintrag mit diesem URL-Slug existiert bereits');
        }
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBlogEntryDto) {
    const entry = await this.prisma.blogEntry.findUnique({ where: { id } });

    if (!entry) {
      throw new NotFoundException('Blog-Eintrag nicht gefunden');
    }

    const updateData: any = {};
    if (dto.title) {
      updateData.title = dto.title;
    }
    if (dto.slug) {
      updateData.slug = dto.slug;
    } else if (dto.title) {
      updateData.slug = this.generateSlug(dto.title);
    }
    if (dto.excerpt !== undefined) {
      updateData.excerpt = dto.excerpt;
    }
    if (dto.content) {
      updateData.content = dto.content;
    }

    try {
      return await this.prisma.blogEntry.update({
        where: { id },
        data: updateData,
        include: { author: { select: { id: true, name: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Ein Eintrag mit diesem URL-Slug existiert bereits');
        }
      }
      throw error;
    }
  }

  async publish(id: string) {
    const entry = await this.prisma.blogEntry.findUnique({ where: { id } });

    if (!entry) {
      throw new NotFoundException('Blog-Eintrag nicht gefunden');
    }

    const wasAlreadyPublished = entry.status === 'PUBLISHED';

    const published = await this.prisma.blogEntry.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: entry.publishedAt || new Date(),
      },
      include: { author: { select: { id: true, name: true } } },
    });

    // Send email notification to all members only on first publish
    if (!wasAlreadyPublished) {
      const users = await this.prisma.user.findMany({
        where: { role: 'MEMBER' },
        select: { email: true },
      });

      const emails = users.map((u: Pick<User, 'email'>) => u.email);
      if (emails.length > 0) {
        await this.emailService.sendBlogPublishedNotification(emails, entry.title, published.slug);
      }
    }

    return published;
  }

  async remove(id: string) {
    await this.prisma.blogEntry.delete({ where: { id } });
    return { message: 'Blog-Eintrag geloescht' };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  }
}
