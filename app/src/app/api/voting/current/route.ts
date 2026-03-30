import { NextResponse } from 'next/server';
import { getCurrentVotingRound } from '@/lib/services/voting';

export async function GET() {
  try {
    const round = await getCurrentVotingRound();

    if (!round) {
      return NextResponse.json(null);
    }

    return NextResponse.json(round);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
