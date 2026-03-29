'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { deleteDistributionCenterAction } from '@/lib/actions/distribution-centers';
import { Plus, Pencil, Trash2, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface DistributionCenter {
  id: string;
  name: string;
  address: string;
  active: boolean;
  _count?: { subscriptions: number };
}

export default function AdminDistributionCentersPage() {
  const { toast } = useToast();
  const [centers, setCenters] = useState<DistributionCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCenters = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/distribution-centers');
      if (res.ok) {
        setCenters(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Moechtest du "${name}" wirklich loeschen? Dies ist nur moeglich, wenn keine Abonnements zugeordnet sind.`)) {
      return;
    }

    try {
      await deleteDistributionCenterAction(id);
      toast({ title: 'Abholstelle geloescht' });
      loadCenters();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Loeschen',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Abholstellen verwalten</h1>
        <Link href="/admin/distribution-centers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Abholstelle
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Laden...</div>
      ) : centers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Abholstellen vorhanden.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((center) => (
            <Card key={center.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    {center.name}
                  </CardTitle>
                  {center.active ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                      <XCircle className="h-4 w-4" />
                      Inaktiv
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{center.address}</p>
                {center._count && (
                  <p className="text-sm text-gray-500 mb-4">
                    {center._count.subscriptions} Abonnements
                  </p>
                )}
                <div className="flex gap-2">
                  <Link href={`/admin/distribution-centers/${center.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(center.id, center.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
