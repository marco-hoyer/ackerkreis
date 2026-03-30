import { db } from '@/lib/db';

export interface CreateCenterInput {
  name: string;
  address: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  active?: boolean;
}

export interface UpdateCenterInput {
  name?: string;
  address?: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  active?: boolean;
}

export async function getDistributionCenters() {
  return db.distributionCenter.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
}

export async function getDistributionCenter(id: string) {
  const center = await db.distributionCenter.findUnique({
    where: { id },
    include: {
      _count: { select: { subscriptions: true } },
    },
  });

  if (!center) {
    throw new Error('Verteilpunkt nicht gefunden');
  }

  return center;
}

export async function createDistributionCenter(input: CreateCenterInput) {
  return db.distributionCenter.create({
    data: {
      name: input.name,
      address: input.address,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      active: input.active ?? true,
    },
  });
}

export async function updateDistributionCenter(id: string, input: UpdateCenterInput) {
  await getDistributionCenter(id);

  return db.distributionCenter.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.address && { address: input.address }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.latitude !== undefined && { latitude: input.latitude }),
      ...(input.longitude !== undefined && { longitude: input.longitude }),
      ...(input.active !== undefined && { active: input.active }),
    },
  });
}

export async function deleteDistributionCenter(id: string) {
  await getDistributionCenter(id);
  await db.distributionCenter.update({
    where: { id },
    data: { active: false },
  });
  return { message: 'Verteilpunkt deaktiviert' };
}
