import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getTransactions } from '@/lib/services/finance';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await getTransactions(page, limit, false);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
