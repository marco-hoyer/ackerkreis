import { NextRequest, NextResponse } from 'next/server';
import { sendMagicLink } from '@/lib/auth/magic-link';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-Mail erforderlich' }, { status: 400 });
    }

    await sendMagicLink(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Senden';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
