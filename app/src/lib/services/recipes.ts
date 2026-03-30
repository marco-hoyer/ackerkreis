import { db } from '@/lib/db';
import type { Recipe } from '@prisma/client';

export interface CreateRecipeInput {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
}

export interface UpdateRecipeInput {
  title?: string;
  description?: string | null;
  ingredients?: string[];
  instructions?: string;
}

export async function getRecipes(page = 1, limit = 20, ingredientFilter: string[] = []) {
  const skip = (page - 1) * limit;

  if (ingredientFilter.length > 0) {
    const allRecipes = await db.recipe.findMany({
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = allRecipes.filter((recipe: Recipe & { author: { id: string; name: string } }) => {
      const recipeIngredients = (recipe.ingredients as string[]).map((i) => i.toLowerCase());
      return ingredientFilter.every((searchIngredient) =>
        recipeIngredients.some((ri) => ri.includes(searchIngredient))
      );
    });

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  const [recipes, total] = await Promise.all([
    db.recipe.findMany({
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.recipe.count(),
  ]);

  return {
    data: recipes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllIngredients(): Promise<string[]> {
  const recipes = await db.recipe.findMany({
    select: { ingredients: true },
  });

  const allIngredients = new Set<string>();
  for (const recipe of recipes) {
    const ingredients = recipe.ingredients as string[];
    for (const ingredient of ingredients) {
      const cleaned = ingredient
        .replace(/^\d+\s*(g|kg|ml|l|el|tl|stueck|stück)?\s*/i, '')
        .trim();
      if (cleaned) {
        allIngredients.add(cleaned.toLowerCase());
      }
    }
  }

  return Array.from(allIngredients).sort();
}

export async function getRecipe(id: string) {
  const recipe = await db.recipe.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!recipe) {
    throw new Error('Rezept nicht gefunden');
  }

  return recipe;
}

export async function createRecipe(input: CreateRecipeInput, authorId: string) {
  return db.recipe.create({
    data: {
      title: input.title,
      description: input.description,
      ingredients: input.ingredients,
      instructions: input.instructions,
      authorId,
    },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function updateRecipe(id: string, input: UpdateRecipeInput) {
  await getRecipe(id);

  return db.recipe.update({
    where: { id },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.ingredients && { ingredients: input.ingredients }),
      ...(input.instructions && { instructions: input.instructions }),
    },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function deleteRecipe(id: string) {
  await getRecipe(id);
  await db.recipe.delete({ where: { id } });
  return { message: 'Rezept geloescht' };
}
