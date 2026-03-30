'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { createDistributionCenterAction } from '@/lib/actions/distribution-centers';
import { ArrowLeft } from 'lucide-react';

export default function NewDistributionCenterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createDistributionCenterAction({
        name,
        address,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });
      toast({ title: 'Abholstelle erstellt' });
      router.push('/admin/distribution-centers');
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
        <Link href="/admin/distribution-centers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold">Neue Abholstelle erstellen</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Stadtmitte"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Musterstrasse 1, 12345 Musterstadt"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Breitengrad</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="z.B. 52.52"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Laengengrad</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="z.B. 13.405"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Wird erstellt...' : 'Erstellen'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/distribution-centers')}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
}
