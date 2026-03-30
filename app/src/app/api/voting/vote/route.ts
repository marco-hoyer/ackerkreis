import { NextRequest, NextResponse } from 'next/server';
import { submitVote } from '@/lib/services/voting';
import { requireUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user.subscriptionId) {
      return NextResponse.json(
        { error: 'Kein Abonnement zugeordnet' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Ungueltiger Betrag' },
        { status: 400 }
      );
    }

    const vote = await submitVote(user.id, user.subscriptionId, amount);
    return NextResponse.json(vote);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Speichern';
    const status = message === 'Nicht angemeldet' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
