import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RecipeForm } from '@/components/forms/recipe-form';
import { getRecipe } from '@/lib/services/recipes';
import { requireAdmin } from '@/lib/auth/session';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  let recipe;
  try {
    recipe = await getRecipe(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/recipes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold">Rezept bearbeiten</h1>

      <RecipeForm recipe={{
        id: recipe.id,
        title: recipe.title,
        description: recipe.description ?? undefined,
        ingredients: recipe.ingredients as string[],
        instructions: recipe.instructions,
      }} />
    </div>
  );
}
