'use client';

import { useState, useEffect } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
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

  useEffect(() => {
    loadPasskeys();
  }, []);

  const loadPasskeys = async () => {
    try {
      const res = await apiClient.get<Passkey[]>('/auth/passkeys');
      setPasskeys(res.data);
    } catch (error) {
      console.error('Failed to load passkeys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);

    try {
      // Start registration
      const startRes = await apiClient.post<any>('/auth/passkey/register/start');
      const options = startRes.data;

      // Trigger browser passkey creation
      const regResponse = await startRegistration(options);

      // Verify with backend
      await apiClient.post('/auth/passkey/register/finish', regResponse);

      toast({ title: 'Passkey hinzugefuegt' });
      loadPasskeys();
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast({
          variant: 'destructive',
          title: 'Abgebrochen',
          description: 'Passkey-Registrierung wurde abgebrochen.',
        });
      } else if (error.name === 'InvalidStateError') {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Dieser Passkey ist bereits registriert.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: error.message || 'Passkey-Registrierung fehlgeschlagen.',
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (passkeyId: string) => {
    if (!confirm('Moechtest du diesen Passkey wirklich loeschen?')) return;

    try {
      await apiClient.delete(`/auth/passkeys/${passkeyId}`);
      toast({ title: 'Passkey geloescht' });
      setPasskeys(passkeys.filter((pk) => pk.id !== passkeyId));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
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
