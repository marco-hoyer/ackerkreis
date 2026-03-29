'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Mail, MapPin, MessageSquare, Calendar } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  distributionCenter?: { name: string };
  createdAt: string;
  reviewedBy?: { name: string };
  reviewedAt?: string;
}

interface ApplicationsResponse {
  data: Application[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export default function AdminApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    loadApplications();
  }, [page, statusFilter]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter
        ? `/applications?page=${page}&limit=20&status=${statusFilter}`
        : `/applications?page=${page}&limit=20`;
      const res = await apiClient.get<ApplicationsResponse>(url);
      setApplications(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.patch(`/applications/${id}/approve`);
      toast({ title: 'Bewerbung angenommen' });
      loadApplications();
      setSelectedApp(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Moechtest du diese Bewerbung wirklich ablehnen?')) return;

    try {
      await apiClient.patch(`/applications/${id}/reject`);
      toast({ title: 'Bewerbung abgelehnt' });
      loadApplications();
      setSelectedApp(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; text: string; class: string }> = {
      PENDING: { icon: <Clock className="h-4 w-4" />, text: 'Ausstehend', class: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { icon: <CheckCircle className="h-4 w-4" />, text: 'Angenommen', class: 'bg-green-100 text-green-800' },
      REJECTED: { icon: <XCircle className="h-4 w-4" />, text: 'Abgelehnt', class: 'bg-red-100 text-red-800' },
    };
    const { icon, text, class: className } = config[status] || config.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {icon}
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bewerbungen verwalten</h1>

      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', ''].map((status) => (
          <Button
            key={status || 'all'}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setStatusFilter(status); setPage(1); }}
          >
            {status === '' ? 'Alle' : status === 'PENDING' ? 'Ausstehend' : status === 'APPROVED' ? 'Angenommen' : 'Abgelehnt'}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bewerbungen</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Laden...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Keine Bewerbungen vorhanden.</div>
            ) : (
              <div className="divide-y">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`py-4 cursor-pointer hover:bg-gray-50 -mx-4 px-4 ${selectedApp?.id === app.id ? 'bg-green-50' : ''}`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {app.email}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(app.createdAt).toLocaleDateString('de-DE')}
                      {app.distributionCenter && (
                        <>
                          <span className="mx-2">•</span>
                          <MapPin className="h-3 w-3" />
                          {app.distributionCenter.name}
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Zurueck
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Seite {page} von {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Weiter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedApp && (
          <Card>
            <CardHeader>
              <CardTitle>Bewerbungsdetails</CardTitle>
              <CardDescription>{selectedApp.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">E-Mail</p>
                  <p className="font-medium">{selectedApp.email}</p>
                </div>
                {selectedApp.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium">{selectedApp.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Gewuenschte Abholstelle</p>
                  <p className="font-medium">{selectedApp.distributionCenter?.name || 'Keine Angabe'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Eingereicht am</p>
                  <p className="font-medium">{new Date(selectedApp.createdAt).toLocaleString('de-DE')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <MessageSquare className="h-4 w-4" />
                  Nachricht
                </p>
                <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                  {selectedApp.message}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Status</p>
                {getStatusBadge(selectedApp.status)}
                {selectedApp.reviewedBy && (
                  <p className="text-sm text-gray-500 mt-2">
                    Bearbeitet von {selectedApp.reviewedBy.name} am{' '}
                    {new Date(selectedApp.reviewedAt!).toLocaleString('de-DE')}
                  </p>
                )}
              </div>

              {selectedApp.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={() => handleApprove(selectedApp.id)} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Annehmen
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedApp.id)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Ablehnen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
