'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/lib/hooks/use-toast';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  author: { id: string; name: string };
  createdAt: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
      router.push('/recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Moechtest du dieses Rezept wirklich loeschen?')) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/recipes/${params.id}`);
      toast({ title: 'Rezept geloescht' });
      router.push('/recipes');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  if (!recipe) {
    return <div className="text-center py-8">Rezept nicht gefunden.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/recipes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck zu Rezepten
          </Button>
        </Link>
        {user?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <Link href={`/admin/recipes/${recipe.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Loeschen
            </Button>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-gray-600 mt-2">{recipe.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-2">
          von {recipe.author.name} am{' '}
          {new Date(recipe.createdAt).toLocaleDateString('de-DE')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zutaten</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Zubereitung</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-green prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: recipe.instructions }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
