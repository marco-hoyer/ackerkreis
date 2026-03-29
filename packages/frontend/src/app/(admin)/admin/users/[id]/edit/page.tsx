'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/forms/user-form';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'MEMBER' | 'ADMIN';
  subscriptionId?: string | null;
}

export default function EditUserPage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [params.id]);

  const loadUser = async () => {
    try {
      const res = await apiClient.get<User>(`/users/${params.id}`);
      setUser(res.data);
    } catch (err: any) {
      setError(err.message || 'Benutzer nicht gefunden');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">Laden...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurueck
            </Button>
          </Link>
        </div>
        <div className="text-center py-8 text-red-600">
          {error || 'Benutzer nicht gefunden'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold">Benutzer bearbeiten</h1>
      <p className="text-gray-500">{user.email}</p>

      <UserForm user={user} />
    </div>
  );
}
