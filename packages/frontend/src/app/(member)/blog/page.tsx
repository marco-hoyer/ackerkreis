'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogEntry {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author: { name: string };
  publishedAt: string;
}

interface BlogResponse {
  data: BlogEntry[];
  pagination: {
    page: number;
    totalPages: number;
  };
}

export default function BlogPage() {
  const [entries, setEntries] = useState<BlogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEntries();
  }, [page]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<BlogResponse>(`/blog?page=${page}&limit=10`);
      setEntries(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && entries.length === 0) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-gray-600 mt-2">Neuigkeiten und Updates von der Solawi</p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Blog-Eintraege vorhanden.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/blog/${entry.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{entry.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {entry.author.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(entry.publishedAt).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </CardDescription>
                </CardHeader>
                {entry.excerpt && (
                  <CardContent>
                    <p className="text-gray-600 line-clamp-2">{entry.excerpt}</p>
                    <span className="inline-flex items-center text-green-600 mt-2 text-sm font-medium">
                      Weiterlesen <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
    </div>
  );
}
