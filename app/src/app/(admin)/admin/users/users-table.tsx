'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/hooks/use-toast';
import { deleteUserAction } from '@/lib/actions/users';
import { Plus, Pencil, Trash2, Search, Shield, User as UserIcon } from 'lucide-react';
import type { User, Subscription } from '@prisma/client';

type UserWithSubscription = User & { subscription: Subscription | null };

interface UsersTableProps {
  initialUsers: UserWithSubscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentPage: number;
}

export function UsersTable({ initialUsers, pagination, currentPage }: UsersTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Moechtest du "${name}" wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteUserAction(id);
      toast({ title: 'Benutzer geloescht' });
      router.refresh();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredUsers = search
    ? initialUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.subscription?.subscriptionId.toLowerCase().includes(search.toLowerCase())
      )
    : initialUsers;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Benutzer verwalten</h1>
          <p className="text-gray-500 mt-1">{pagination.total} Benutzer insgesamt</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Benutzer
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alle Benutzer</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {search ? 'Keine Benutzer gefunden.' : 'Noch keine Benutzer vorhanden.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">E-Mail</th>
                      <th className="pb-3 font-medium">Rolle</th>
                      <th className="pb-3 font-medium">Abonnement</th>
                      <th className="pb-3 font-medium">Erstellt</th>
                      <th className="pb-3 font-medium text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {user.role === 'ADMIN' ? (
                              <Shield className="h-4 w-4 text-blue-600" />
                            ) : (
                              <UserIcon className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">{user.email}</td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {user.role === 'ADMIN' ? 'Admin' : 'Mitglied'}
                          </span>
                        </td>
                        <td className="py-4 text-gray-600">
                          {user.subscription?.subscriptionId || '-'}
                        </td>
                        <td className="py-4 text-gray-500 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/users/${user.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user.id, user.name)}
                              disabled={isDeleting === user.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Link href={`/admin/users?page=${currentPage - 1}`}>
                    <Button variant="outline" disabled={currentPage === 1}>
                      Zurueck
                    </Button>
                  </Link>
                  <span className="flex items-center px-4 text-sm">
                    Seite {currentPage} von {pagination.totalPages}
                  </span>
                  <Link href={`/admin/users?page=${currentPage + 1}`}>
                    <Button variant="outline" disabled={currentPage === pagination.totalPages}>
                      Weiter
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
