'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { importTransactionsAction, manualMatchTransactionAction } from '@/lib/actions/finance';
import { Upload, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Link as LinkIcon } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  matched: boolean;
  subscription?: { subscriptionId: string };
}

interface Statistics {
  totalIncome: number;
  expectedIncome: number;
  difference: number;
  transactionCount: number;
  matchedCount: number;
  unmatchedCount: number;
}

interface NegativeBalance {
  subscriptionId: string;
  balance: number;
  subscriptionName: string;
}

interface TransactionsResponse {
  data: Transaction[];
  pagination: { page: number; totalPages: number };
}

export default function AdminFinancePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'import' | 'transactions' | 'unmatched'>('overview');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [negativeBalances, setNegativeBalances] = useState<NegativeBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [csvContent, setCsvContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; matched: number } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [activeTab, page]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'overview') {
        const [statsRes, negRes] = await Promise.all([
          fetch('/api/finance/statistics'),
          fetch('/api/finance/negative-balances'),
        ]);
        if (statsRes.ok) setStatistics(await statsRes.json());
        if (negRes.ok) setNegativeBalances(await negRes.json());
      } else if (activeTab === 'transactions') {
        const res = await fetch(`/api/finance/transactions?page=${page}&limit=50`);
        if (res.ok) {
          const data: TransactionsResponse = await res.json();
          setTransactions(data.data);
          setTotalPages(data.pagination.totalPages);
        }
      } else if (activeTab === 'unmatched') {
        const res = await fetch(`/api/finance/unmatched?page=${page}&limit=50`);
        if (res.ok) {
          const data: TransactionsResponse = await res.json();
          setTransactions(data.data);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvContent(event.target?.result as string);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleImport = async () => {
    if (!csvContent) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importTransactionsAction(csvContent);
      setImportResult({ imported: result.total, matched: result.matched });
      toast({ title: `${result.total} Transaktionen importiert, ${result.matched} zugeordnet` });
      setCsvContent('');
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Import fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Fehler beim Import',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualMatch = async (transactionId: string, subscriptionId: string) => {
    try {
      await manualMatchTransactionAction(transactionId, subscriptionId);
      toast({ title: 'Transaktion zugeordnet' });
      loadData();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Zuordnen',
      });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Uebersicht' },
    { id: 'import', label: 'CSV Import' },
    { id: 'transactions', label: 'Alle Transaktionen' },
    { id: 'unmatched', label: 'Nicht zugeordnet' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Finanzverwaltung</h1>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setPage(1); }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {statistics && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Einnahmen (Jahr)</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {statistics.totalIncome.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Erwartet (Jahr)</CardDescription>
                  <CardTitle className="text-2xl">
                    {statistics.expectedIncome.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Differenz</CardDescription>
                  <CardTitle className={`text-2xl flex items-center gap-2 ${statistics.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics.difference >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    {statistics.difference >= 0 ? '+' : ''}{statistics.difference.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Transaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold">{statistics.transactionCount}</p>
                    <p className="text-sm text-gray-500">Gesamt</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{statistics.matchedCount}</p>
                    <p className="text-sm text-gray-500">Zugeordnet</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">{statistics.unmatchedCount}</p>
                    <p className="text-sm text-gray-500">Offen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {negativeBalances.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle>Negative Salden</CardTitle>
                </div>
                <CardDescription>Abonnements mit negativem Kontostand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {negativeBalances.map((item) => (
                    <div key={item.subscriptionId} className="py-3 flex justify-between items-center">
                      <span className="font-mono font-bold">{item.subscriptionId}</span>
                      <span className="text-red-600 font-semibold">{item.balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle>CSV-Datei importieren</CardTitle>
            <CardDescription>
              Importiere Banktransaktionen im deutschen CSV-Format (Semikolon-getrennt).
              Transaktionen werden automatisch anhand der Abonnement-ID (S0001, S0002, ...) im Verwendungszweck zugeordnet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv">CSV-Datei auswaehlen</Label>
              <Input
                id="csv"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isImporting}
              />
            </div>

            {csvContent && (
              <div className="space-y-2">
                <Label>Vorschau (erste 500 Zeichen)</Label>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto max-h-48">
                  {csvContent.substring(0, 500)}...
                </pre>
              </div>
            )}

            <Button onClick={handleImport} disabled={!csvContent || isImporting}>
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Wird importiert...' : 'Importieren'}
            </Button>

            {importResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  {importResult.imported} Transaktionen importiert, {importResult.matched} automatisch zugeordnet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(activeTab === 'transactions' || activeTab === 'unmatched') && (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'transactions' ? 'Alle Transaktionen' : 'Nicht zugeordnete Transaktionen'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Laden...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Keine Transaktionen vorhanden.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium">Datum</th>
                        <th className="pb-2 font-medium">Betrag</th>
                        <th className="pb-2 font-medium">Verwendungszweck</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-2">{new Date(tx.date).toLocaleDateString('de-DE')}</td>
                          <td className={`py-2 font-mono ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                          </td>
                          <td className="py-2 max-w-xs truncate" title={tx.description}>
                            {tx.description}
                          </td>
                          <td className="py-2">
                            {tx.matched ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                {tx.subscription?.subscriptionId}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-yellow-600">
                                <XCircle className="h-4 w-4" />
                                Offen
                              </span>
                            )}
                          </td>
                          <td className="py-2">
                            {!tx.matched && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const subId = prompt('Abonnement-ID eingeben (z.B. S0001):');
                                  if (subId) handleManualMatch(tx.id, subId);
                                }}
                              >
                                <LinkIcon className="h-3 w-3 mr-1" />
                                Zuordnen
                              </Button>
                            )}
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
      )}
    </div>
  );
}
