'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';

interface DistributionCenter {
  id: string;
  name: string;
}

interface SubscriptionFormProps {
  subscription?: {
    id: string;
    subscriptionId: string;
    status: string;
    distributionCenterId: string;
  };
}

export function SubscriptionForm({ subscription }: SubscriptionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [centers, setCenters] = useState<DistributionCenter[]>([]);
  const [distributionCenterId, setDistributionCenterId] = useState(subscription?.distributionCenterId || '');
  const [status, setStatus] = useState(subscription?.status || 'ACTIVE');

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const res = await apiClient.get<DistributionCenter[]>('/distribution-centers');
      setCenters(res.data);
      if (!subscription && res.data.length > 0 && !distributionCenterId) {
        setDistributionCenterId(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load distribution centers', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        distributionCenterId,
        status,
      };

      if (subscription) {
        await apiClient.patch(`/subscriptions/${subscription.id}`, data);
        toast({ title: 'Abonnement aktualisiert' });
      } else {
        await apiClient.post('/subscriptions', data);
        toast({ title: 'Abonnement erstellt' });
      }
      router.push('/admin/subscriptions');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Abonnement-Daten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription && (
            <div className="space-y-2">
              <Label>Abonnement-ID</Label>
              <Input value={subscription.subscriptionId} disabled />
              <p className="text-sm text-gray-500">Die ID kann nicht geaendert werden.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="center">Abholstelle *</Label>
            <select
              id="center"
              value={distributionCenterId}
              onChange={(e) => setDistributionCenterId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
              disabled={isLoading}
            >
              <option value="">Bitte waehlen...</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="ACTIVE">Aktiv</option>
              <option value="SUSPENDED">Pausiert</option>
              <option value="CANCELLED">Gekuendigt</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Wird gespeichert...'
            : subscription
              ? 'Aktualisieren'
              : 'Erstellen'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/subscriptions')}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
