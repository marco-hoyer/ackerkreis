import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getNegativeBalances } from '@/lib/services/finance';

export async function GET() {
  try {
    await requireAdmin();
    const balances = await getNegativeBalances();
    return NextResponse.json(balances);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
