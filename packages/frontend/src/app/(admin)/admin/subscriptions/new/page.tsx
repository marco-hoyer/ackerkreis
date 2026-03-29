'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SubscriptionForm } from '@/components/forms/subscription-form';
import { ArrowLeft } from 'lucide-react';

export default function NewSubscriptionPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/subscriptions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold">Neues Abonnement erstellen</h1>
      <p className="text-gray-500">Die Abonnement-ID wird automatisch generiert.</p>

      <SubscriptionForm />
    </div>
  );
}
