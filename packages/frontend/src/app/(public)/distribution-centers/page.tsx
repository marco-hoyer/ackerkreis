'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';

interface Center {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

const DistributionCentersMap = dynamic(
  () => import('@/components/map/distribution-centers-map'),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Karte wird geladen...</div> }
);

export default function DistributionCentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  useEffect(() => {
    apiClient.get<Center[]>('/distribution-centers').then((res) => {
      setCenters(res.data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const centersWithCoordinates = centers.filter(c => c.latitude && c.longitude);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-700">
            Solawi Manager
          </Link>
          <div className="flex gap-4">
            <Link href="/about">
              <Button variant="ghost">Ueber uns</Button>
            </Link>
            <Link href="/distribution-centers">
              <Button variant="ghost">Verteilpunkte</Button>
            </Link>
            <Link href="/login">
              <Button>Anmelden</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Unsere Verteilpunkte</h1>
            <p className="text-lg text-gray-600">
              Hier kannst du dein woechentliches Gemuese abholen. Waehle den Verteilpunkt, der am besten fuer dich passt.
            </p>
          </div>

          {isLoading ? (
            <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Verteilpunkte werden geladen...</p>
            </div>
          ) : centersWithCoordinates.length > 0 ? (
            <div className="mb-8">
              <DistributionCentersMap
                centers={centersWithCoordinates}
                onSelectCenter={setSelectedCenter}
                selectedCenter={selectedCenter}
              />
            </div>
          ) : (
            <div className="h-[200px] bg-gray-100 rounded-lg flex items-center justify-center mb-8">
              <p className="text-gray-500">Keine Verteilpunkte mit Koordinaten vorhanden.</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {centers.map((center) => (
              <Card
                key={center.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCenter?.id === center.id ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedCenter(center)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{center.name}</CardTitle>
                  <CardDescription>{center.address}</CardDescription>
                </CardHeader>
                {center.description && (
                  <CardContent>
                    <p className="text-gray-600 text-sm">{center.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {centers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Derzeit sind keine Verteilpunkte verfuegbar.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Moechtest du Teil unserer Gemeinschaft werden?</p>
            <Link href="/apply">
              <Button size="lg">Jetzt bewerben</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Solawi Manager. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
