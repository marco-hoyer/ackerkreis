'use client';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Willkommen, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">
          Hier ist dein persoenliches Dashboard fuer die Solawi.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/subscription">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Dein Abonnement</CardTitle>
              <CardDescription>Abonnement-Informationen und Kontostand</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Schau dir deine Abonnement-Details und deinen aktuellen Kontostand an.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/voting">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Abstimmung</CardTitle>
              <CardDescription>Jahresbeitrag bestimmen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Nimm an der Abstimmung teil und bestimme deinen monatlichen Beitrag.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/blog">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Blog</CardTitle>
              <CardDescription>Neuigkeiten und Updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Lies die neuesten Beitraege und Updates von der Solawi.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/recipes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Rezepte</CardTitle>
              <CardDescription>Kochideen aus der Gemeinschaft</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Entdecke und teile Rezepte mit anderen Mitgliedern.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
