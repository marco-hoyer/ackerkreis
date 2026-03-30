import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getDistributionCenter } from '@/lib/services/distribution-centers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const center = await getDistributionCenter(id);
    return NextResponse.json(center);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
