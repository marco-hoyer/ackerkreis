import { NextRequest, NextResponse } from 'next/server';
import { getBlogEntryBySlug } from '@/lib/services/blog';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const entry = await getBlogEntryBySlug(slug);
    return NextResponse.json(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
