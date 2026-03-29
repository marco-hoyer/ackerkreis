'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
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
      const startRes = await apiClient.post<{ options: any; challengeKey: string }>(
        '/auth/passkey/login/start',
      );

      const { options, challengeKey } = startRes.data;

      // Trigger browser passkey prompt
      const authResponse = await startAuthentication(options);

      // Verify with backend
      await apiClient.post('/auth/passkey/login/finish', {
        response: authResponse,
        challengeKey,
      });

      toast({ title: 'Erfolgreich angemeldet' });
      await refetchUser();
      router.push('/dashboard');
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast({
          variant: 'destructive',
          title: 'Abgebrochen',
          description: 'Passkey-Anmeldung wurde abgebrochen.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: error.message || 'Passkey-Anmeldung fehlgeschlagen.',
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
