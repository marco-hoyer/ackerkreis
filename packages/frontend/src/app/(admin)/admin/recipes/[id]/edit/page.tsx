'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeForm } from '@/components/forms/recipe-form';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
}

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [params.id]);

  const loadRecipe = async () => {
    try {
      const res = await apiClient.get<Recipe>(`/recipes/${params.id}`);
      setRecipe(res.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Rezept konnte nicht geladen werden.',
      });
      router.push('/admin/recipes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  if (!recipe) {
    return <div className="text-center py-8">Rezept nicht gefunden.</div>;
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

      <RecipeForm recipe={recipe} />
    </div>
  );
}
