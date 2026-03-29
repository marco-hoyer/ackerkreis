'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { CreditCard, MapPin, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface Subscription {
  id: string;
  subscriptionId: string;
  status: string;
  distributionCenter?: {
    name: string;
    address: string;
  } | null;
  users?: { id: string; name: string; email: string }[];
}

interface Balance {
  subscriptionId?: string;
  monthlyAmount?: number;
  expectedAmount?: number;
  totalPaid?: number;
  balance?: number;
  transactions?: number;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.subscriptionId) {
      loadSubscription();
    } else {
      setIsLoading(false);
    }
  }, [user?.subscriptionId]);

  const loadSubscription = async () => {
    try {
      const [subRes, balRes] = await Promise.all([
        apiClient.get<Subscription>(`/subscriptions/${user!.subscriptionId}`),
        apiClient.get<Balance>(`/subscriptions/${user!.subscriptionId}/balance`),
      ]);
      setSubscription(subRes.data);
      setBalance(balRes.data);
    } catch (error) {
      console.error('Failed to load subscription', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  if (!user?.subscriptionId || !subscription) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">
              Du hast noch kein Abonnement. Bitte wende dich an einen Administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPositive = balance && (balance.balance ?? 0) >= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mein Abonnement</h1>
        <p className="text-gray-600 mt-2">Uebersicht deiner Mitgliedschaft</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <CardTitle>Abonnement-Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Abonnement-ID</p>
              <p className="text-2xl font-bold text-green-700">{subscription.subscriptionId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscription.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription.status === 'ACTIVE' ? 'Aktiv' : subscription.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {subscription.distributionCenter && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <CardTitle>Abholstelle</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{subscription.distributionCenter.name}</p>
              <p className="text-gray-600">{subscription.distributionCenter.address}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <CardTitle>Mitglieder</CardTitle>
            </div>
            <CardDescription>Personen in diesem Abonnement</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(subscription.users ?? []).map((member) => (
                <li key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-gray-500">{member.email}</span>
                </li>
              ))}
              {(!subscription.users || subscription.users.length === 0) && (
                <li className="text-gray-500">Keine Mitglieder zugeordnet</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {balance && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <CardTitle>Kontostand</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gebot (monatlich)</p>
                  <p className="text-xl font-semibold">{(balance.monthlyAmount ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Erwartet (bisher)</p>
                  <p className="text-xl font-semibold">{(balance.expectedAmount ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gezahlt (gesamt)</p>
                  <p className="text-xl font-semibold">{(balance.totalPaid ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaktionen</p>
                  <p className="text-xl font-semibold">{balance.transactions ?? 0}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Aktueller Saldo</p>
                <p className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {(balance.balance ?? 0) >= 0 ? '+' : ''}{(balance.balance ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
