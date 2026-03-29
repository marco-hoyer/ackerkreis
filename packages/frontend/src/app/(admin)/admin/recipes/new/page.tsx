'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeForm } from '@/components/forms/recipe-form';
import { ArrowLeft } from 'lucide-react';

export default function NewRecipePage() {
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

      <h1 className="text-3xl font-bold">Neues Rezept erstellen</h1>

      <RecipeForm />
    </div>
  );
}
