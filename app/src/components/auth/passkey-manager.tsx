'use client';

import { useState, useEffect, useCallback } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { Fingerprint, Plus, Trash2, Key } from 'lucide-react';

interface Passkey {
  id: string;
  credentialId: string;
  createdAt: string;
}

export function PasskeyManager() {
  const { toast } = useToast();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const loadPasskeys = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/passkey/list');
      if (res.ok) {
        const data = await res.json();
        setPasskeys(data);
      }
    } catch (error) {
      console.error('Failed to load passkeys:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPasskeys();
  }, [loadPasskeys]);

  const handleRegister = async () => {
    setIsRegistering(true);

    try {
      // Start registration
      const startRes = await fetch('/api/auth/passkey/register/start', {
        method: 'POST',
      });

      if (!startRes.ok) {
        const error = await startRes.json();
        throw new Error(error.error || 'Fehler beim Starten');
      }

      const options = await startRes.json();

      // Trigger browser passkey creation
      const regResponse = await startRegistration(options);

      // Verify with backend
      const finishRes = await fetch('/api/auth/passkey/register/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regResponse),
      });

      if (!finishRes.ok) {
        const error = await finishRes.json();
        throw new Error(error.error || 'Registrierung fehlgeschlagen');
      }

      toast({ title: 'Passkey hinzugefuegt' });
      loadPasskeys();
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          variant: 'destructive',
          title: 'Abgebrochen',
          description: 'Passkey-Registrierung wurde abgebrochen.',
        });
      } else if (error instanceof Error && error.name === 'InvalidStateError') {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Dieser Passkey ist bereits registriert.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: error instanceof Error ? error.message : 'Passkey-Registrierung fehlgeschlagen.',
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (passkeyId: string) => {
    if (!confirm('Moechtest du diesen Passkey wirklich loeschen?')) return;

    try {
      const res = await fetch(`/api/auth/passkey/delete?id=${passkeyId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Loeschen fehlgeschlagen');
      }

      toast({ title: 'Passkey geloescht' });
      setPasskeys(passkeys.filter((pk) => pk.id !== passkeyId));
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Loeschen',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-green-600" />
          <CardTitle>Passkeys</CardTitle>
        </div>
        <CardDescription>
          Melde dich schnell und sicher mit Fingerabdruck, Face ID oder Sicherheitsschluessel an.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-gray-500">Laden...</p>
        ) : passkeys.length === 0 ? (
          <p className="text-sm text-gray-500">
            Du hast noch keine Passkeys registriert.
          </p>
        ) : (
          <div className="space-y-2">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Passkey</p>
                    <p className="text-xs text-gray-500">
                      Erstellt am{' '}
                      {new Date(passkey.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(passkey.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleRegister}
          disabled={isRegistering}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isRegistering ? 'Wird registriert...' : 'Passkey hinzufuegen'}
        </Button>
      </CardContent>
    </Card>
  );
}
