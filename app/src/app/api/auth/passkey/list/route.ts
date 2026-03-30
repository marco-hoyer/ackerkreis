import { NextResponse } from 'next/server';
import { getUserPasskeys } from '@/lib/auth/passkey';
import { requireUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await requireUser();
    const passkeys = await getUserPasskeys(user.id);

    return NextResponse.json(passkeys);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    const status = message === 'Nicht angemeldet' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
