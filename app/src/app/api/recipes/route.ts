import { NextRequest, NextResponse } from 'next/server';
import { getRecipes } from '@/lib/services/recipes';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const ingredientsParam = searchParams.get('ingredients');
    const ingredients = ingredientsParam ? ingredientsParam.split(',') : [];

    const result = await getRecipes(page, limit, ingredients);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
