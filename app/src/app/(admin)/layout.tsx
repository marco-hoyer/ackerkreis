'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold text-green-700">
                Solawi Manager
              </Link>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Admin
              </span>
            </div>
            <nav className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">Uebersicht</Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">Benutzer</Button>
              </Link>
              <Link href="/admin/subscriptions">
                <Button variant="ghost" size="sm">Abonnements</Button>
              </Link>
              <Link href="/admin/recipes">
                <Button variant="ghost" size="sm">Rezepte</Button>
              </Link>
              <Link href="/admin/blog">
                <Button variant="ghost" size="sm">Blog</Button>
              </Link>
              <Link href="/admin/finance">
                <Button variant="ghost" size="sm">Finanzen</Button>
              </Link>
              <Link href="/admin/applications">
                <Button variant="ghost" size="sm">Bewerbungen</Button>
              </Link>
              <Link href="/admin/voting">
                <Button variant="ghost" size="sm">Abstimmung</Button>
              </Link>
              <Link href="/admin/distribution-centers">
                <Button variant="ghost" size="sm">Abholstellen</Button>
              </Link>
              <div className="ml-4 border-l pl-4 flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Mitgliederbereich</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Abmelden
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
