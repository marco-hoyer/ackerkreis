'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { deleteBlogEntryAction, publishBlogEntryAction } from '@/lib/actions/blog';
import { Plus, Pencil, Trash2, Send, FileText, Eye } from 'lucide-react';

interface BlogEntry {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  author: { name: string };
  createdAt: string;
  publishedAt?: string;
}

interface BlogResponse {
  data: BlogEntry[];
  pagination: {
    page: number;
    totalPages: number;
  };
}

export default function AdminBlogPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<BlogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/blog/admin?page=${page}&limit=20`);
      if (res.ok) {
        const data: BlogResponse = await res.json();
        setEntries(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Moechtest du "${title}" wirklich loeschen?`)) return;

    try {
      await deleteBlogEntryAction(id);
      toast({ title: 'Eintrag geloescht' });
      loadEntries();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Loeschen',
      });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishBlogEntryAction(id);
      toast({ title: 'Eintrag veroeffentlicht' });
      loadEntries();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Veroeffentlichen',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog verwalten</h1>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Eintrag
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Laden...</div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Blog-Eintraege vorhanden.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle Eintraege</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-start gap-3">
                    {entry.status === 'DRAFT' ? (
                      <FileText className="h-5 w-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <Eye className="h-5 w-5 text-green-500 mt-0.5" />
                    )}
                    <div>
                      <h3 className="font-medium">{entry.title}</h3>
                      <p className="text-sm text-gray-500">
                        von {entry.author.name} •{' '}
                        {entry.status === 'PUBLISHED' && entry.publishedAt
                          ? `Veroeffentlicht am ${new Date(entry.publishedAt).toLocaleDateString('de-DE')}`
                          : `Entwurf vom ${new Date(entry.createdAt).toLocaleDateString('de-DE')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {entry.status === 'DRAFT' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublish(entry.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Veroeffentlichen
                      </Button>
                    )}
                    <Link href={`/admin/blog/${entry.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(entry.id, entry.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Zurueck
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Seite {page} von {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Weiter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
