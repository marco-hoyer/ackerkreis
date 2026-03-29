import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getFinanceStatistics } from '@/lib/services/finance';

export async function GET() {
  try {
    await requireAdmin();
    const statistics = await getFinanceStatistics();
    return NextResponse.json(statistics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
