import { NextRequest, NextResponse } from 'next/server';
import { finishPasskeyRegistration } from '@/lib/auth/passkey';
import { requireUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();

    const passkey = await finishPasskeyRegistration(user.id, body);

    return NextResponse.json({ success: true, passkey });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen';
    const status = message === 'Nicht angemeldet' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
