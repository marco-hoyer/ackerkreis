import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        include: { distributionCenter: true, reviewer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { distributionCenter: true, reviewer: true },
    });

    if (!application) {
      throw new NotFoundException('Bewerbung nicht gefunden');
    }

    return application;
  }

  async create(dto: CreateApplicationDto) {
    const application = await this.prisma.application.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        message: dto.message,
        distributionCenterId: dto.distributionCenterId,
      },
      include: { distributionCenter: true },
    });

    // Send confirmation email
    await this.emailService.sendApplicationConfirmation(dto.email, dto.name);

    return application;
  }

  async approve(id: string, reviewerId: string) {
    await this.findOne(id);

    return this.prisma.application.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
      include: { distributionCenter: true, reviewer: true },
    });
  }

  async reject(id: string, reviewerId: string) {
    await this.findOne(id);

    return this.prisma.application.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
      include: { distributionCenter: true, reviewer: true },
    });
  }
}
