import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { rejectApplication } from '@/lib/services/applications';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const application = await rejectApplication(id, admin.id);
    return NextResponse.json(application);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Bearbeiten';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
