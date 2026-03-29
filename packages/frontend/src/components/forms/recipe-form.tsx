'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';
import { X, Plus } from 'lucide-react';

interface RecipeFormProps {
  recipe?: {
    id: string;
    title: string;
    description?: string;
    ingredients: string[];
    instructions: string;
  };
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [ingredients, setIngredients] = useState<string[]>(
    recipe?.ingredients || [''],
  );
  const [instructions, setInstructions] = useState(recipe?.instructions || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const filteredIngredients = ingredients.filter((i) => i.trim() !== '');

    if (filteredIngredients.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Mindestens eine Zutat ist erforderlich.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const data = {
        title,
        description: description || undefined,
        ingredients: filteredIngredients,
        instructions,
      };

      if (recipe) {
        await apiClient.patch(`/recipes/${recipe.id}`, data);
        toast({ title: 'Rezept aktualisiert' });
      } else {
        await apiClient.post('/recipes', data);
        toast({ title: 'Rezept erstellt' });
      }
      router.push('/admin/recipes');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grundinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Kartoffelsalat"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Kurzbeschreibung</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Ein klassischer Sommersalat"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zutaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder="z.B. 500g Kartoffeln"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1 || isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addIngredient}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Zutat hinzufuegen
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zubereitung *</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            content={instructions}
            onChange={setInstructions}
            placeholder="Beschreibe die Zubereitungsschritte..."
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-2">
            Nutze die Toolbar um Text zu formatieren und Bilder einzufuegen.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Wird gespeichert...'
            : recipe
              ? 'Aktualisieren'
              : 'Erstellen'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/recipes')}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
