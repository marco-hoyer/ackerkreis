import { NextRequest, NextResponse } from 'next/server';
import { finishPasskeyAuthentication } from '@/lib/auth/passkey';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { response: authResponse, challengeKey } = body;

    if (!authResponse || !challengeKey) {
      return NextResponse.json(
        { error: 'Fehlende Daten' },
        { status: 400 }
      );
    }

    // finishPasskeyAuthentication sets the session cookie internally
    const user = await finishPasskeyAuthentication(authResponse, challengeKey);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentifizierung fehlgeschlagen';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
