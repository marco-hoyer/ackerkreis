import { db } from '@/lib/db';
import { sendApplicationConfirmation } from '@/lib/email';
import type { ApplicationStatus } from '@prisma/client';

export interface CreateApplicationInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
  distributionCenterId: string;
}

export async function getApplications(page = 1, limit = 20, status?: ApplicationStatus) {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [applications, total] = await Promise.all([
    db.application.findMany({
      where,
      skip,
      take: limit,
      include: { distributionCenter: true, reviewer: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.application.count({ where }),
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

export async function getApplication(id: string) {
  const application = await db.application.findUnique({
    where: { id },
    include: { distributionCenter: true, reviewer: true },
  });

  if (!application) {
    throw new Error('Bewerbung nicht gefunden');
  }

  return application;
}

export async function createApplication(input: CreateApplicationInput) {
  const application = await db.application.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      message: input.message,
      distributionCenterId: input.distributionCenterId,
    },
    include: { distributionCenter: true },
  });

  await sendApplicationConfirmation(input.email, input.name);

  return application;
}

export async function approveApplication(id: string, reviewerId: string) {
  await getApplication(id);

  return db.application.update({
    where: { id },
    data: {
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    },
    include: { distributionCenter: true, reviewer: true },
  });
}

export async function rejectApplication(id: string, reviewerId: string) {
  await getApplication(id);

  return db.application.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    },
    include: { distributionCenter: true, reviewer: true },
  });
}
