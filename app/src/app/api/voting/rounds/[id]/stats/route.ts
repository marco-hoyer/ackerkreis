import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getVotingStats } from '@/lib/services/voting';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const stats = await getVotingStats(id);
    return NextResponse.json({
      voteCount: stats.votedSubscriptions,
      totalVotedMonthly: stats.totalVotedMonthly,
      totalVotedYearly: stats.totalVotedYearly,
      targetIncome: stats.targetIncome,
      percentageReached: stats.percentageReached,
      averageVote: stats.averageMonthlyVote,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
