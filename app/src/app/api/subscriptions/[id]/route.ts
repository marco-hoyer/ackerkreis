import { NextRequest, NextResponse } from 'next/server';
import { getSubscription } from '@/lib/services/subscriptions';
import { requireUser } from '@/lib/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Users can only view their own subscription
    if (user.subscriptionId !== id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 });
    }

    const subscription = await getSubscription(id);
    return NextResponse.json(subscription);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
