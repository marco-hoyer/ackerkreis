'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';

interface Center {
  id: string;
  name: string;
  address: string;
  description?: string;
}

export default function ApplyPage() {
  const { toast } = useToast();
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    distributionCenterId: '',
  });

  useEffect(() => {
    fetch('/api/distribution-centers')
      .then((res) => res.json())
      .then((data: Center[]) => {
        setCenters(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, distributionCenterId: data[0].id }));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Fehler beim Senden');
      }

      setIsSubmitted(true);
      toast({
        title: 'Bewerbung gesendet',
        description: 'Wir haben deine Bewerbung erhalten und melden uns bei dir.',
      });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Senden',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">Vielen Dank!</CardTitle>
            <CardDescription>
              Deine Bewerbung wurde erfolgreich gesendet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Wir werden deine Bewerbung pruefen und uns bei dir melden. Du erhaeltst eine
              Bestaetigungs-E-Mail an die angegebene Adresse.
            </p>
            <Link href="/">
              <Button>Zurueck zur Startseite</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-green-700">
            Solawi Manager
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Bewerbung</CardTitle>
            <CardDescription>
              Fuell das Formular aus, um dich fuer ein Abonnement zu bewerben.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefonnummer</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="center">Bevorzugter Verteilpunkt *</Label>
                <select
                  id="center"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.distributionCenterId}
                  onChange={(e) => setFormData({ ...formData, distributionCenterId: e.target.value })}
                  required
                  disabled={isLoading}
                >
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name} - {center.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nachricht *</Label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Erzaehl uns etwas ueber dich und warum du Teil der Solawi werden moechtest..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Wird gesendet...' : 'Bewerbung absenden'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link href="/" className="hover:underline">
                Zurueck zur Startseite
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
