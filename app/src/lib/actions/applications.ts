'use server';

import { requireAdmin } from '@/lib/auth/session';
import {
  createApplication,
  approveApplication,
  rejectApplication,
  type CreateApplicationInput,
} from '@/lib/services/applications';
import { revalidatePath } from 'next/cache';

export async function createApplicationAction(input: CreateApplicationInput) {
  // Public action - no auth required
  const application = await createApplication(input);
  return application;
}

export async function approveApplicationAction(id: string) {
  const admin = await requireAdmin();
  const application = await approveApplication(id, admin.id);
  revalidatePath('/admin/applications');
  return application;
}

export async function rejectApplicationAction(id: string) {
  const admin = await requireAdmin();
  const application = await rejectApplication(id, admin.id);
  revalidatePath('/admin/applications');
  return application;
}
