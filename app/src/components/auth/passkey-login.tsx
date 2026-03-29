'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/lib/hooks/use-toast';
import { Fingerprint } from 'lucide-react';

export function PasskeyLogin() {
  const router = useRouter();
  const { refetchUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePasskeyLogin = async () => {
    setIsLoading(true);

    try {
      // Start authentication
      const startRes = await fetch('/api/auth/passkey/login/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!startRes.ok) {
        const error = await startRes.json();
        throw new Error(error.error || 'Fehler beim Starten');
      }

      const { options, challengeKey } = await startRes.json();

      // Trigger browser passkey prompt
      const authResponse = await startAuthentication(options);

      // Verify with backend
      const finishRes = await fetch('/api/auth/passkey/login/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: authResponse, challengeKey }),
      });

      if (!finishRes.ok) {
        const error = await finishRes.json();
        throw new Error(error.error || 'Authentifizierung fehlgeschlagen');
      }

      toast({ title: 'Erfolgreich angemeldet' });
      await refetchUser();
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          variant: 'destructive',
          title: 'Abgebrochen',
          description: 'Passkey-Anmeldung wurde abgebrochen.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: error instanceof Error ? error.message : 'Passkey-Anmeldung fehlgeschlagen.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handlePasskeyLogin}
      disabled={isLoading}
    >
      <Fingerprint className="h-4 w-4 mr-2" />
      {isLoading ? 'Wird geprueft...' : 'Mit Passkey anmelden'}
    </Button>
  );
}
