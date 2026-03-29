'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, MapPin, Users } from 'lucide-react';

interface Subscription {
  id: string;
  subscriptionId: string;
  status: string;
  distributionCenter?: { name: string } | null;
  users?: { id: string; name: string }[];
  createdAt: string;
}

interface SubscriptionsResponse {
  data: Subscription[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, [page]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<SubscriptionsResponse>(`/subscriptions?page=${page}&limit=20`);
      setSubscriptions(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, subId: string) => {
    if (!confirm(`Moechtest du Abonnement "${subId}" wirklich loeschen?`)) {
      return;
    }

    try {
      await apiClient.delete(`/subscriptions/${id}`);
      toast({ title: 'Abonnement geloescht' });
      loadSubscriptions();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    }
  };

  const filteredSubscriptions = search
    ? subscriptions.filter(
        (s) =>
          s.subscriptionId.toLowerCase().includes(search.toLowerCase()) ||
          s.distributionCenter?.name.toLowerCase().includes(search.toLowerCase()) ||
          s.users?.some((u) => u.name.toLowerCase().includes(search.toLowerCase()))
      )
    : subscriptions;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Aktiv',
      SUSPENDED: 'Pausiert',
      CANCELLED: 'Gekuendigt',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Abonnements verwalten</h1>
          <p className="text-gray-500 mt-1">{total} Abonnements insgesamt</p>
        </div>
        <Link href="/admin/subscriptions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neues Abonnement
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alle Abonnements</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Laden...</div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {search ? 'Keine Abonnements gefunden.' : 'Noch keine Abonnements vorhanden.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Abholstelle</th>
                      <th className="pb-3 font-medium">Mitglieder</th>
                      <th className="pb-3 font-medium">Erstellt</th>
                      <th className="pb-3 font-medium text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredSubscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <span className="font-mono font-bold text-green-700">{sub.subscriptionId}</span>
                        </td>
                        <td className="py-4">{getStatusBadge(sub.status)}</td>
                        <td className="py-4">
                          <span className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {sub.distributionCenter?.name || '-'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Users className="h-4 w-4" />
                            {sub.users?.length || 0} {(sub.users?.length || 0) === 1 ? 'Person' : 'Personen'}
                          </span>
                        </td>
                        <td className="py-4 text-gray-500 text-sm">
                          {new Date(sub.createdAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/subscriptions/${sub.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(sub.id, sub.subscriptionId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Zurueck
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Seite {page} von {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Weiter
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
