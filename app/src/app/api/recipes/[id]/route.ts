import { NextRequest, NextResponse } from 'next/server';
import { getRecipe } from '@/lib/services/recipes';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipe = await getRecipe(id);
    return NextResponse.json(recipe);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
