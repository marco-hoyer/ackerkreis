'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/use-toast';
import { Plus, Play, Square, Target, Users, TrendingUp, BarChart3 } from 'lucide-react';

interface VotingRound {
  id: string;
  year: number;
  targetIncome: number;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  _count?: { votes: number };
}

interface RoundStats {
  totalVotedMonthly?: number;
  totalVotedYearly?: number;
  targetIncome?: number;
  percentageReached?: number;
  voteCount?: number;
  averageVote?: number;
}

export default function AdminVotingPage() {
  const { toast } = useToast();
  const [rounds, setRounds] = useState<VotingRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<VotingRound | null>(null);
  const [stats, setStats] = useState<RoundStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<VotingRound[]>('/voting/rounds');
      setRounds(res.data);
      if (res.data.length > 0) {
        setSelectedRound(res.data[0]);
        loadStats(res.data[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async (roundId: string) => {
    try {
      const res = await apiClient.get<RoundStats>(`/voting/rounds/${roundId}/stats`);
      setStats(res.data);
    } catch (error) {
      setStats(null);
    }
  };

  const handleOpen = async (id: string) => {
    try {
      await apiClient.post(`/voting/rounds/${id}/open`);
      toast({ title: 'Abstimmungsrunde geoeffnet' });
      loadRounds();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Moechtest du die Abstimmungsrunde wirklich schliessen?')) return;
    try {
      await apiClient.post(`/voting/rounds/${id}/close`);
      toast({ title: 'Abstimmungsrunde geschlossen' });
      loadRounds();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { text: string; class: string }> = {
      DRAFT: { text: 'Entwurf', class: 'bg-gray-100 text-gray-800' },
      OPEN: { text: 'Offen', class: 'bg-green-100 text-green-800' },
      CLOSED: { text: 'Geschlossen', class: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { text: 'Abgeschlossen', class: 'bg-blue-100 text-blue-800' },
    };
    const { text, class: className } = config[status] || config.DRAFT;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Abstimmungsrunden verwalten</h1>
        <Link href="/admin/voting/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Runde
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Laden...</div>
      ) : rounds.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Abstimmungsrunden vorhanden.
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alle Runden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {rounds.map((round) => (
                  <div
                    key={round.id}
                    className={`py-4 cursor-pointer hover:bg-gray-50 -mx-4 px-4 ${selectedRound?.id === round.id ? 'bg-green-50' : ''}`}
                    onClick={() => { setSelectedRound(round); loadStats(round.id); }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">{round.year}</p>
                        <p className="text-sm text-gray-500">
                          Ziel: {round.targetIncome.toLocaleString('de-DE')} EUR/Jahr
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(round.status)}
                        {round._count && (
                          <p className="text-sm text-gray-500 mt-1">
                            {round._count.votes} Stimmen
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedRound && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Runde {selectedRound.year}</CardTitle>
                      <CardDescription>Details und Statistiken</CardDescription>
                    </div>
                    {getStatusBadge(selectedRound.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-gray-600">Ziel-Einkommen:</span>
                    <span className="font-bold">{selectedRound.targetIncome.toLocaleString('de-DE')} EUR/Jahr</span>
                  </div>

                  {selectedRound.status === 'DRAFT' && (
                    <Button onClick={() => handleOpen(selectedRound.id)} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Abstimmung starten
                    </Button>
                  )}

                  {selectedRound.status === 'OPEN' && (
                    <Button onClick={() => handleClose(selectedRound.id)} variant="outline" className="w-full">
                      <Square className="h-4 w-4 mr-2" />
                      Abstimmung beenden
                    </Button>
                  )}
                </CardContent>
              </Card>

              {stats && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <CardTitle>Statistiken</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Abgegebene Stimmen</p>
                        <p className="text-2xl font-bold flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-600" />
                          {stats.voteCount ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Durchschnitt/Monat</p>
                        <p className="text-2xl font-bold">{(stats.averageVote ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Summe/Monat</p>
                        <p className="text-2xl font-bold">{(stats.totalVotedMonthly ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Summe/Jahr</p>
                        <p className="text-2xl font-bold">{(stats.totalVotedYearly ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Ziel erreicht</span>
                        <span className={`font-bold ${(stats.percentageReached ?? 0) >= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {(stats.percentageReached ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full transition-all ${(stats.percentageReached ?? 0) >= 100 ? 'bg-green-600' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.min(stats.percentageReached ?? 0, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {(stats.totalVotedYearly ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} von {(stats.targetIncome ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
