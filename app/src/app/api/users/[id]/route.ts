import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getUser, updateUser } from '@/lib/services/users';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await getUser(id);
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const user = await updateUser(id, body);
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Aktualisieren';
    const status = message === 'Nicht angemeldet' ? 401 : message === 'Keine Berechtigung' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
