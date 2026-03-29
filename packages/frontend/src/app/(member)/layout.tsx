'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-green-700">
              Solawi Manager
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/subscription">
                <Button variant="ghost">Abonnement</Button>
              </Link>
              <Link href="/voting">
                <Button variant="ghost">Abstimmung</Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost">Blog</Button>
              </Link>
              <Link href="/recipes">
                <Button variant="ghost">Rezepte</Button>
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline">Admin</Button>
                </Link>
              )}
              <div className="ml-4 flex items-center gap-2 border-l pl-4">
                <Link href="/settings">
                  <Button variant="ghost" size="sm">{user.name}</Button>
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
