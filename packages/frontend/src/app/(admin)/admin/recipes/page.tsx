'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  author: { id: string; name: string };
  createdAt: string;
}

interface RecipesResponse {
  data: Recipe[];
  pagination: {
    page: number;
    totalPages: number;
  };
}

export default function AdminRecipesPage() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadRecipes();
  }, [page]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<RecipesResponse>(
        `/recipes?page=${page}&limit=20`,
      );
      setRecipes(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Moechtest du "${title}" wirklich loeschen?`)) return;

    try {
      await apiClient.delete(`/recipes/${id}`);
      toast({ title: 'Rezept geloescht' });
      loadRecipes();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rezepte verwalten</h1>
        <Link href="/admin/recipes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neues Rezept
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Laden...</div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Rezepte vorhanden.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle Rezepte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium">{recipe.title}</h3>
                    <p className="text-sm text-gray-500">
                      {recipe.ingredients.length} Zutaten • von{' '}
                      {recipe.author.name} •{' '}
                      {new Date(recipe.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/recipes/${recipe.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(recipe.id, recipe.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Zurueck
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Seite {page} von {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Weiter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
