import { NextRequest, NextResponse } from 'next/server';
import { deletePasskey } from '@/lib/auth/passkey';
import { requireUser } from '@/lib/auth/session';

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const passkeyId = searchParams.get('id');

    if (!passkeyId) {
      return NextResponse.json({ error: 'Passkey-ID fehlt' }, { status: 400 });
    }

    await deletePasskey(user.id, passkeyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Loeschen fehlgeschlagen';
    const status = message === 'Nicht angemeldet' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
