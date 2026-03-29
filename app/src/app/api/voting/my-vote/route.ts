import { NextRequest, NextResponse } from 'next/server';
import { getMyVote } from '@/lib/services/voting';
import { requireUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get('roundId');

    if (!roundId) {
      return NextResponse.json({ error: 'roundId fehlt' }, { status: 400 });
    }

    const vote = await getMyVote(user.id, roundId);

    if (!vote) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(vote);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
