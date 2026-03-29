'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { updateDistributionCenterAction } from '@/lib/actions/distribution-centers';
import { ArrowLeft } from 'lucide-react';

interface DistributionCenter {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  active: boolean;
}

export default function EditDistributionCenterPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [center, setCenter] = useState<DistributionCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [active, setActive] = useState(true);

  const loadCenter = useCallback(async () => {
    try {
      const res = await fetch(`/api/distribution-centers/${params.id}`);
      if (!res.ok) throw new Error('Abholstelle nicht gefunden');
      const data: DistributionCenter = await res.json();
      setCenter(data);
      setName(data.name);
      setAddress(data.address);
      setLatitude(data.latitude?.toString() || '');
      setLongitude(data.longitude?.toString() || '');
      setActive(data.active);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Abholstelle nicht gefunden');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadCenter();
  }, [loadCenter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateDistributionCenterAction(params.id as string, {
        name,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        active,
      });
      toast({ title: 'Abholstelle aktualisiert' });
      router.push('/admin/distribution-centers');
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Speichern',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">Laden...</div>
      </div>
    );
  }

  if (error || !center) {
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
        <div className="text-center py-8 text-red-600">
          {error || 'Abholstelle nicht gefunden'}
        </div>
      </div>
    );
  }

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

      <h1 className="text-3xl font-bold">Abholstelle bearbeiten</h1>

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
                required
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <select
                id="active"
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSaving}
              >
                <option value="true">Aktiv</option>
                <option value="false">Inaktiv</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Wird gespeichert...' : 'Aktualisieren'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/distribution-centers')}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
}
