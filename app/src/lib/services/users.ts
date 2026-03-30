import { db } from '@/lib/db';
import type { UserRole } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
  subscriptionId?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: UserRole;
  subscriptionId?: string | null;
}

export async function getUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    db.user.findMany({
      skip,
      take: limit,
      include: { subscription: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count(),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUser(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  return user;
}

export async function createUser(input: CreateUserInput) {
  return db.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role || 'MEMBER',
      subscriptionId: input.subscriptionId,
    },
    include: { subscription: true },
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await getUser(id);

  return db.user.update({
    where: { id },
    data: {
      ...(input.email && { email: input.email.toLowerCase() }),
      ...(input.name && { name: input.name }),
      ...(input.role && { role: input.role }),
      ...(input.subscriptionId !== undefined && { subscriptionId: input.subscriptionId }),
    },
    include: { subscription: true },
  });
}

export async function deleteUser(id: string) {
  await getUser(id);
  await db.user.delete({ where: { id } });
  return { message: 'Benutzer geloescht' };
}
