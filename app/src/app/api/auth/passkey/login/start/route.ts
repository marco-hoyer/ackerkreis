import { NextRequest, NextResponse } from 'next/server';
import { startPasskeyAuthentication } from '@/lib/auth/passkey';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email as string | undefined;

    const result = await startPasskeyAuthentication(email);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Starten';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
