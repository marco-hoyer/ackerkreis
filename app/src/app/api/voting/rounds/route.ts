import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getVotingRounds } from '@/lib/services/voting';

export async function GET() {
  try {
    await requireAdmin();
    const rounds = await getVotingRounds();
    return NextResponse.json(rounds);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
