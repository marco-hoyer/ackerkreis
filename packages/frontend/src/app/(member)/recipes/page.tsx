'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/providers/auth-provider';
import { X } from 'lucide-react';

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
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function RecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    // Load all available ingredients
    apiClient.get<string[]>('/recipes/ingredients').then((res) => {
      setAllIngredients(res.data);
    });
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [selectedIngredients, pagination.page]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '12',
      });
      if (selectedIngredients.length > 0) {
        params.set('ingredients', selectedIngredients.join(','));
      }
      const res = await apiClient.get<RecipesResponse>(`/recipes?${params}`);
      setRecipes(res.data.data);
      setPagination((prev) => ({
        ...prev,
        totalPages: res.data.pagination.totalPages,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = (ingredient: string) => {
    const normalized = ingredient.toLowerCase().trim();
    if (normalized && !selectedIngredients.includes(normalized)) {
      setSelectedIngredients([...selectedIngredients, normalized]);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
    setSearchInput('');
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const filteredSuggestions = allIngredients.filter(
    (i) =>
      i.includes(searchInput.toLowerCase()) &&
      !selectedIngredients.includes(i),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rezepte</h1>
          <p className="text-gray-600 mt-2">
            Entdecke Rezepte aus der Gemeinschaft
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/admin/recipes/new">
            <Button>Neues Rezept</Button>
          </Link>
        )}
      </div>

      {/* Ingredient Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Nach Zutaten suchen</CardTitle>
          <CardDescription>
            Waehle Zutaten aus, um passende Rezepte zu finden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Selected Ingredients Tags */}
          {selectedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedIngredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="hover:text-green-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelectedIngredients([])}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Alle entfernen
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Zutat eingeben..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchInput.trim()) {
                  addIngredient(searchInput);
                }
              }}
            />
            {/* Suggestions Dropdown */}
            {searchInput && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                {filteredSuggestions.slice(0, 10).map((ingredient) => (
                  <button
                    key={ingredient}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                    onClick={() => addIngredient(ingredient)}
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="text-center py-8">Laden...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {selectedIngredients.length > 0
            ? 'Keine Rezepte mit diesen Zutaten gefunden.'
            : 'Noch keine Rezepte vorhanden.'}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                    {recipe.description && (
                      <CardDescription className="line-clamp-2">
                        {recipe.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {ingredient.replace(/^\d+\s*(g|kg|ml|l|el|tl|stueck|stück)?\s*/i, '').substring(0, 20)}
                        </span>
                      ))}
                      {recipe.ingredients.length > 5 && (
                        <span className="px-2 py-0.5 text-gray-400 text-xs">
                          +{recipe.ingredients.length - 5} mehr
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      von {recipe.author.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Zurueck
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Seite {pagination.page} von {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Weiter
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
