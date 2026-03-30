import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SubscriptionForm } from '@/components/forms/subscription-form';
import { getSubscription } from '@/lib/services/subscriptions';
import { requireAdmin } from '@/lib/auth/session';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSubscriptionPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  let subscription;
  try {
    subscription = await getSubscription(id);
  } catch {
    notFound();
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
