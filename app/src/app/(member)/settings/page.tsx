'use client';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasskeyManager } from '@/components/auth/passkey-manager';
import { User } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-gray-600 mt-2">Verwalte dein Konto und deine Sicherheitseinstellungen.</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            <CardTitle>Profil</CardTitle>
          </div>
          <CardDescription>Deine Kontoinformationen</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
              <dd className="mt-1">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Rolle</dt>
              <dd className="mt-1">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Mitglied'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Passkey Management */}
      <PasskeyManager />
    </div>
  );
}
