'use server';

import { requireUser } from '@/lib/auth/session';
import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  type CreateRecipeInput,
  type UpdateRecipeInput,
} from '@/lib/services/recipes';
import { revalidatePath } from 'next/cache';

export async function createRecipeAction(input: CreateRecipeInput) {
  const user = await requireUser();
  const recipe = await createRecipe(input, user.id);
  revalidatePath('/recipes');
  revalidatePath('/admin/recipes');
  return recipe;
}

export async function updateRecipeAction(id: string, input: UpdateRecipeInput) {
  await requireUser();
  const recipe = await updateRecipe(id, input);
  revalidatePath('/recipes');
  revalidatePath(`/recipes/${id}`);
  revalidatePath('/admin/recipes');
  revalidatePath(`/admin/recipes/${id}/edit`);
  return recipe;
}

export async function deleteRecipeAction(id: string) {
  await requireUser();
  const result = await deleteRecipe(id);
  revalidatePath('/recipes');
  revalidatePath('/admin/recipes');
  return result;
}
