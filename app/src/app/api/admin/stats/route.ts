import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();

    const [userCount, subscriptionCount, pendingCount, unmatchedCount] = await Promise.all([
      db.user.count(),
      db.subscription.count(),
      db.application.count({ where: { status: 'PENDING' } }),
      db.bankTransaction.count({ where: { subscriptionId: null } }),
    ]);

    return NextResponse.json({
      users: userCount,
      subscriptions: subscriptionCount,
      pendingApplications: pendingCount,
      unmatchedTransactions: unmatchedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
