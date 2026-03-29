import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/auth/magic-link';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'E-Mail und Code erforderlich' }, { status: 400 });
    }

    const user = await verifyMagicLink(email, code);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionId: user.subscriptionId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login fehlgeschlagen';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
