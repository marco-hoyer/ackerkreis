'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { Users, Package, BookOpen, FileText, DollarSign, ClipboardList, Vote, MapPin, AlertCircle, TrendingUp } from 'lucide-react';

interface Stats {
  users: number;
  subscriptions: number;
  pendingApplications: number;
  unmatchedTransactions: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, subsRes, appsRes, financeRes] = await Promise.all([
        apiClient.get<{ pagination: { total: number } }>('/users?limit=1'),
        apiClient.get<{ pagination: { total: number } }>('/subscriptions?limit=1'),
        apiClient.get<{ pagination: { total: number } }>('/applications?status=PENDING&limit=1'),
        apiClient.get<{ unmatchedCount: number }>('/finance/statistics'),
      ]);
      setStats({
        users: usersRes.data.pagination.total,
        subscriptions: subsRes.data.pagination.total,
        pendingApplications: appsRes.data.pagination.total,
        unmatchedTransactions: financeRes.data.unmatchedCount || 0,
      });
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  const sections = [
    {
      title: 'Benutzer',
      description: 'Mitglieder und Administratoren verwalten',
      href: '/admin/users',
      icon: Users,
      stat: stats?.users,
    },
    {
      title: 'Abonnements',
      description: 'Abonnements und Zuordnungen verwalten',
      href: '/admin/subscriptions',
      icon: Package,
      stat: stats?.subscriptions,
    },
    {
      title: 'Rezepte',
      description: 'Rezepte erstellen und bearbeiten',
      href: '/admin/recipes',
      icon: BookOpen,
    },
    {
      title: 'Blog',
      description: 'Blog-Beitraege verwalten',
      href: '/admin/blog',
      icon: FileText,
    },
    {
      title: 'Finanzen',
      description: 'Transaktionen und Statistiken',
      href: '/admin/finance',
      icon: DollarSign,
      stat: stats?.unmatchedTransactions,
      statLabel: 'offen',
      alert: stats?.unmatchedTransactions && stats.unmatchedTransactions > 0,
    },
    {
      title: 'Bewerbungen',
      description: 'Neue Bewerbungen pruefen',
      href: '/admin/applications',
      icon: ClipboardList,
      stat: stats?.pendingApplications,
      statLabel: 'neu',
      alert: stats?.pendingApplications && stats.pendingApplications > 0,
    },
    {
      title: 'Abstimmung',
      description: 'Abstimmungsrunden verwalten',
      href: '/admin/voting',
      icon: Vote,
    },
    {
      title: 'Abholstellen',
      description: 'Verteilungsorte verwalten',
      href: '/admin/distribution-centers',
      icon: MapPin,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin-Bereich</h1>
        <p className="text-gray-600 mt-2">
          Verwaltung der Solawi-Plattform
        </p>
      </div>

      {stats && (stats.pendingApplications > 0 || stats.unmatchedTransactions > 0) && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Aufgaben:</span>
              {stats.pendingApplications > 0 && (
                <Link href="/admin/applications" className="underline">
                  {stats.pendingApplications} neue Bewerbung{stats.pendingApplications > 1 ? 'en' : ''}
                </Link>
              )}
              {stats.pendingApplications > 0 && stats.unmatchedTransactions > 0 && <span>•</span>}
              {stats.unmatchedTransactions > 0 && (
                <Link href="/admin/finance" className="underline">
                  {stats.unmatchedTransactions} offene Transaktion{stats.unmatchedTransactions > 1 ? 'en' : ''}
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className={`h-full hover:shadow-md transition-shadow cursor-pointer ${section.alert ? 'border-yellow-400' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <section.icon className="h-5 w-5 text-green-600" />
                  </div>
                  {section.stat !== undefined && (
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${section.alert ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {section.stat}
                      </span>
                      {section.statLabel && (
                        <span className="text-xs text-gray-500 ml-1">{section.statLabel}</span>
                      )}
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
