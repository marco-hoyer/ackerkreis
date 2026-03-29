import { NextResponse } from 'next/server';
import { getDistributionCenters } from '@/lib/services/distribution-centers';

export async function GET() {
  try {
    const centers = await getDistributionCenters();
    return NextResponse.json(centers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Laden';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
