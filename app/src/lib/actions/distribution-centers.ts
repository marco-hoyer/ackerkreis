'use server';

import { requireAdmin } from '@/lib/auth/session';
import {
  createDistributionCenter,
  updateDistributionCenter,
  deleteDistributionCenter,
  type CreateCenterInput,
  type UpdateCenterInput,
} from '@/lib/services/distribution-centers';
import { revalidatePath } from 'next/cache';

export async function createDistributionCenterAction(input: CreateCenterInput) {
  await requireAdmin();
  const center = await createDistributionCenter(input);
  revalidatePath('/admin/distribution-centers');
  revalidatePath('/distribution-centers');
  return center;
}

export async function updateDistributionCenterAction(id: string, input: UpdateCenterInput) {
  await requireAdmin();
  const center = await updateDistributionCenter(id, input);
  revalidatePath('/admin/distribution-centers');
  revalidatePath(`/admin/distribution-centers/${id}/edit`);
  revalidatePath('/distribution-centers');
  return center;
}

export async function deleteDistributionCenterAction(id: string) {
  await requireAdmin();
  const result = await deleteDistributionCenter(id);
  revalidatePath('/admin/distribution-centers');
  revalidatePath('/distribution-centers');
  return result;
}
