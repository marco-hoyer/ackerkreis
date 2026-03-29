import { NextResponse } from 'next/server';
import { getAllIngredients } from '@/lib/services/recipes';

export async function GET() {
  try {
    const ingredients = await getAllIngredients();
    return NextResponse.json(ingredients);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
