import { db } from '@/lib/db';
import { sendBlogPublishedNotification } from '@/lib/email';
import type { User } from '@prisma/client';

export interface CreateBlogEntryInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
}

export interface UpdateBlogEntryInput {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

export async function getPublishedBlogEntries(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    db.blogEntry.findMany({
      where: { status: 'PUBLISHED' },
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { publishedAt: 'desc' },
    }),
    db.blogEntry.count({ where: { status: 'PUBLISHED' } }),
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

export async function getAllBlogEntries(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    db.blogEntry.findMany({
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.blogEntry.count(),
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

export async function getBlogEntryBySlug(slug: string) {
  const entry = await db.blogEntry.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!entry) {
    throw new Error('Blog-Eintrag nicht gefunden');
  }

  return entry;
}

export async function getBlogEntry(id: string) {
  const entry = await db.blogEntry.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!entry) {
    throw new Error('Blog-Eintrag nicht gefunden');
  }

  return entry;
}

export async function createBlogEntry(input: CreateBlogEntryInput, authorId: string) {
  const slug = input.slug || generateSlug(input.title);

  try {
    return await db.blogEntry.create({
      data: {
        title: input.title,
        slug,
        excerpt: input.excerpt,
        content: input.content,
        authorId,
        status: 'DRAFT',
      },
      include: { author: { select: { id: true, name: true } } },
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('Ein Eintrag mit diesem URL-Slug existiert bereits');
    }
    throw error;
  }
}

export async function updateBlogEntry(id: string, input: UpdateBlogEntryInput) {
  const entry = await db.blogEntry.findUnique({ where: { id } });

  if (!entry) {
    throw new Error('Blog-Eintrag nicht gefunden');
  }

  const updateData: Record<string, unknown> = {};
  if (input.title) {
    updateData.title = input.title;
  }
  if (input.slug) {
    updateData.slug = input.slug;
  } else if (input.title) {
    updateData.slug = generateSlug(input.title);
  }
  if (input.excerpt !== undefined) {
    updateData.excerpt = input.excerpt;
  }
  if (input.content) {
    updateData.content = input.content;
  }

  try {
    return await db.blogEntry.update({
      where: { id },
      data: updateData,
      include: { author: { select: { id: true, name: true } } },
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('Ein Eintrag mit diesem URL-Slug existiert bereits');
    }
    throw error;
  }
}

export async function publishBlogEntry(id: string) {
  const entry = await db.blogEntry.findUnique({ where: { id } });

  if (!entry) {
    throw new Error('Blog-Eintrag nicht gefunden');
  }

  const wasAlreadyPublished = entry.status === 'PUBLISHED';

  const published = await db.blogEntry.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: entry.publishedAt || new Date(),
    },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!wasAlreadyPublished) {
    const users = await db.user.findMany({
      where: { role: 'MEMBER' },
      select: { email: true },
    });

    const emails = users.map((u: Pick<User, 'email'>) => u.email);
    if (emails.length > 0) {
      await sendBlogPublishedNotification(emails, entry.title, published.slug);
    }
  }

  return published;
}

export async function deleteBlogEntry(id: string) {
  await db.blogEntry.delete({ where: { id } });
  return { message: 'Blog-Eintrag geloescht' };
}
