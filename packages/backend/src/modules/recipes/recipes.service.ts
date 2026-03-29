import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import type { Recipe } from '@prisma/client';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, ingredientFilter: string[] = []) {
    const skip = (page - 1) * limit;

    // Get all recipes first if we need to filter by ingredients
    if (ingredientFilter.length > 0) {
      const allRecipes = await this.prisma.recipe.findMany({
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });

      // Filter recipes that contain ALL specified ingredients
      const filtered = allRecipes.filter((recipe: Recipe & { author: { id: string; name: string } }) => {
        const recipeIngredients = (recipe.ingredients as string[]).map((i) =>
          i.toLowerCase(),
        );
        return ingredientFilter.every((searchIngredient) =>
          recipeIngredients.some((ri) => ri.includes(searchIngredient)),
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
      this.prisma.recipe.findMany({
        skip,
        take: limit,
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.recipe.count(),
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

  async getAllIngredients(): Promise<string[]> {
    const recipes = await this.prisma.recipe.findMany({
      select: { ingredients: true },
    });

    const allIngredients = new Set<string>();
    for (const recipe of recipes) {
      const ingredients = recipe.ingredients as string[];
      for (const ingredient of ingredients) {
        // Extract the main ingredient name (remove quantities like "200g")
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

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });

    if (!recipe) {
      throw new NotFoundException('Rezept nicht gefunden');
    }

    return recipe;
  }

  async create(dto: CreateRecipeDto, authorId: string) {
    return this.prisma.recipe.create({
      data: {
        title: dto.title,
        description: dto.description,
        ingredients: dto.ingredients,
        instructions: dto.instructions,
        authorId,
      },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, dto: UpdateRecipeDto) {
    await this.findOne(id);

    return this.prisma.recipe.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.ingredients && { ingredients: dto.ingredients }),
        ...(dto.instructions && { instructions: dto.instructions }),
      },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.recipe.delete({ where: { id } });
    return { message: 'Rezept geloescht' };
  }
}
