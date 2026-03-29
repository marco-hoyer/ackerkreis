'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';

interface Subscription {
  id: string;
  subscriptionId: string;
}

interface UserFormProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'MEMBER' | 'ADMIN';
    subscriptionId?: string | null;
  };
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>(user?.role || 'MEMBER');
  const [subscriptionId, setSubscriptionId] = useState(user?.subscriptionId || '');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const res = await apiClient.get<{ data: Subscription[] }>('/subscriptions?limit=1000');
      setSubscriptions(res.data.data);
    } catch (error) {
      console.error('Failed to load subscriptions', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        email,
        name,
        role,
        subscriptionId: subscriptionId || null,
      };

      if (user) {
        await apiClient.patch(`/users/${user.id}`, data);
        toast({ title: 'Benutzer aktualisiert' });
      } else {
        await apiClient.post('/users', data);
        toast({ title: 'Benutzer erstellt' });
      }
      router.push('/admin/users');
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
          <CardTitle>Benutzerdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="benutzer@beispiel.de"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rolle *</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'MEMBER' | 'ADMIN')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="MEMBER">Mitglied</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription">Abonnement</Label>
            <select
              id="subscription"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="">Kein Abonnement</option>
              {subscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subscriptionId}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Wird gespeichert...'
            : user
              ? 'Aktualisieren'
              : 'Erstellen'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/users')}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
