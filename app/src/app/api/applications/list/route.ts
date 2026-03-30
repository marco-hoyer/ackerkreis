import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getApplications } from '@/lib/services/applications';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const status = searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;

    const result = await getApplications(page, limit, status || undefined);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
