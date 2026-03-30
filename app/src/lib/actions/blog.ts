'use server';

import { requireAdmin } from '@/lib/auth/session';
import {
  createBlogEntry,
  updateBlogEntry,
  publishBlogEntry,
  deleteBlogEntry,
  type CreateBlogEntryInput,
  type UpdateBlogEntryInput,
} from '@/lib/services/blog';
import { revalidatePath } from 'next/cache';

export async function createBlogEntryAction(input: CreateBlogEntryInput) {
  const admin = await requireAdmin();
  const entry = await createBlogEntry(input, admin.id);
  revalidatePath('/admin/blog');
  return entry;
}

export async function updateBlogEntryAction(id: string, input: UpdateBlogEntryInput) {
  await requireAdmin();
  const entry = await updateBlogEntry(id, input);
  revalidatePath('/admin/blog');
  revalidatePath(`/admin/blog/${id}/edit`);
  revalidatePath('/blog');
  return entry;
}

export async function publishBlogEntryAction(id: string) {
  await requireAdmin();
  const entry = await publishBlogEntry(id);
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${entry.slug}`);
  return entry;
}

export async function deleteBlogEntryAction(id: string) {
  await requireAdmin();
  const result = await deleteBlogEntry(id);
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  return result;
}
