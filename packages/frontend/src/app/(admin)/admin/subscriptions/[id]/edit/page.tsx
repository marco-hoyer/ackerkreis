'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SubscriptionForm } from '@/components/forms/subscription-form';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft } from 'lucide-react';

interface Subscription {
  id: string;
  subscriptionId: string;
  status: string;
  distributionCenterId: string;
}

export default function EditSubscriptionPage() {
  const params = useParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, [params.id]);

  const loadSubscription = async () => {
    try {
      const res = await apiClient.get<Subscription>(`/subscriptions/${params.id}`);
      setSubscription(res.data);
    } catch (err: any) {
      setError(err.message || 'Abonnement nicht gefunden');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">Laden...</div>
      </div>
    );
  }

  if (error || !subscription) {
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
        <div className="text-center py-8 text-red-600">
          {error || 'Abonnement nicht gefunden'}
        </div>
      </div>
    );
  }

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

      <h1 className="text-3xl font-bold">Abonnement bearbeiten</h1>
      <p className="text-gray-500 font-mono">{subscription.subscriptionId}</p>

      <SubscriptionForm subscription={subscription} />
    </div>
  );
}
