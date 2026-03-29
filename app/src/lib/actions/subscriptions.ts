'use server';

import { requireAdmin } from '@/lib/auth/session';
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  type CreateSubscriptionInput,
  type UpdateSubscriptionInput,
} from '@/lib/services/subscriptions';
import { revalidatePath } from 'next/cache';

export async function createSubscriptionAction(input: CreateSubscriptionInput) {
  await requireAdmin();
  const subscription = await createSubscription(input);
  revalidatePath('/admin/subscriptions');
  return subscription;
}

export async function updateSubscriptionAction(id: string, input: UpdateSubscriptionInput) {
  await requireAdmin();
  const subscription = await updateSubscription(id, input);
  revalidatePath('/admin/subscriptions');
  revalidatePath(`/admin/subscriptions/${id}/edit`);
  return subscription;
}

export async function deleteSubscriptionAction(id: string) {
  await requireAdmin();
  const result = await deleteSubscription(id);
  revalidatePath('/admin/subscriptions');
  return result;
}
