'use server';

import { requireAdmin } from '@/lib/auth/session';
import {
  createUser,
  updateUser,
  deleteUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/services/users';
import { revalidatePath } from 'next/cache';

export async function createUserAction(input: CreateUserInput) {
  await requireAdmin();
  const user = await createUser(input);
  revalidatePath('/admin/users');
  return user;
}

export async function updateUserAction(id: string, input: UpdateUserInput) {
  await requireAdmin();
  const user = await updateUser(id, input);
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}/edit`);
  return user;
}

export async function deleteUserAction(id: string) {
  await requireAdmin();
  const result = await deleteUser(id);
  revalidatePath('/admin/users');
  return result;
}
