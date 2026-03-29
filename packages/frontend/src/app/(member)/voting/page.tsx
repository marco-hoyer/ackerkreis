'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';
import { Vote, Calendar, Target, CheckCircle } from 'lucide-react';

interface VotingRound {
  id: string;
  year: number;
  targetIncome: number;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
}

interface MyVote {
  id: string;
  amount: number;
  createdAt: string;
}

export default function VotingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentRound, setCurrentRound] = useState<VotingRound | null>(null);
  const [myVote, setMyVote] = useState<MyVote | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCurrentRound();
  }, []);

  const loadCurrentRound = async () => {
    try {
      const res = await apiClient.get<VotingRound>('/voting/current');
      setCurrentRound(res.data);

      if (res.data && res.data.status === 'OPEN') {
        try {
          const voteRes = await apiClient.get<MyVote>(`/voting/my-vote/${res.data.id}`);
          setMyVote(voteRes.data);
          setAmount(voteRes.data.amount.toString());
        } catch {
          // No vote yet
        }
      }
    } catch {
      // No current round
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRound) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/voting/vote', {
        amount: parseFloat(amount),
      });
      toast({ title: myVote ? 'Gebot aktualisiert' : 'Gebot abgegeben' });
      loadCurrentRound();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  if (!user?.subscriptionId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">
              Du musst einem Abonnement zugeordnet sein, um abstimmen zu koennen.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentRound) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Abstimmung</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <Vote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Aktuell laeuft keine Abstimmungsrunde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOpen = currentRound.status === 'OPEN';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Abstimmung {currentRound.year}</h1>
        <p className="text-gray-600 mt-2">
          Gib dein monatliches Gebot fuer das Jahr {currentRound.year} ab.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle>Ziel-Einkommen</CardTitle>
          </div>
          <CardDescription>
            Das benoetigte Jahreseinkommen der Solawi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-700">
            {currentRound.targetIncome.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
          </p>
          <p className="text-sm text-gray-500 mt-1">pro Jahr</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <CardTitle>Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isOpen
              ? 'bg-green-100 text-green-800'
              : currentRound.status === 'COMPLETED'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isOpen ? 'Abstimmung offen' :
             currentRound.status === 'COMPLETED' ? 'Abgeschlossen' :
             currentRound.status === 'CLOSED' ? 'Geschlossen' : 'Entwurf'}
          </span>
        </CardContent>
      </Card>

      {isOpen ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-green-600" />
              <CardTitle>{myVote ? 'Dein Gebot anpassen' : 'Dein Gebot abgeben'}</CardTitle>
            </div>
            <CardDescription>
              Wieviel moechtest du monatlich beitragen?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monatlicher Beitrag (EUR)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="z.B. 85.00"
                  required
                  disabled={isSubmitting}
                  className="text-lg"
                />
              </div>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-sm text-gray-600">
                  Das entspricht {(parseFloat(amount) * 12).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR pro Jahr.
                </p>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Wird gespeichert...' : myVote ? 'Gebot aktualisieren' : 'Gebot abgeben'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : myVote ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle>Dein Gebot</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {myVote.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
            </p>
            <p className="text-sm text-gray-500 mt-1">pro Monat</p>
            <p className="text-sm text-gray-500">
              Abgegeben am {new Date(myVote.createdAt).toLocaleDateString('de-DE')}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
