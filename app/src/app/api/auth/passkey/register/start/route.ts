import { NextResponse } from 'next/server';
import { startPasskeyRegistration } from '@/lib/auth/passkey';
import { requireUser } from '@/lib/auth/session';

export async function POST() {
  try {
    const user = await requireUser();
    const options = await startPasskeyRegistration(user.id);

    return NextResponse.json(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Starten';
    const status = message === 'Nicht angemeldet' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
