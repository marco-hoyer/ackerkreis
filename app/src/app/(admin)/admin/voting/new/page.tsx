'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { createVotingRoundAction } from '@/lib/actions/voting';
import { ArrowLeft } from 'lucide-react';

export default function NewVotingRoundPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [targetIncome, setTargetIncome] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createVotingRoundAction({
        year,
        targetIncome: parseFloat(targetIncome),
      });
      toast({ title: 'Abstimmungsrunde erstellt' });
      router.push('/admin/voting');
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Erstellen',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/voting">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold">Neue Abstimmungsrunde erstellen</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rundendetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">Jahr *</Label>
              <Input
                id="year"
                type="number"
                min={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetIncome">Ziel-Einkommen (EUR/Jahr) *</Label>
              <Input
                id="targetIncome"
                type="number"
                min="0"
                step="0.01"
                value={targetIncome}
                onChange={(e) => setTargetIncome(e.target.value)}
                placeholder="z.B. 120000"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                Das jaehrliche Einkommen, das die Solawi benoetigt.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Wird erstellt...' : 'Runde erstellen'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/voting')}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
}
