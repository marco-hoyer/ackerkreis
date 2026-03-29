import { NextRequest, NextResponse } from 'next/server';
import { createApplication } from '@/lib/services/applications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, distributionCenterId } = body;

    if (!name || !email || !message || !distributionCenterId) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    const application = await createApplication({
      name,
      email,
      phone,
      message,
      distributionCenterId,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Senden';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
