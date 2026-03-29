'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface BlogEntry {
  id: string;
  title: string;
  content: string;
  author: { name: string };
  publishedAt: string;
}

export default function BlogEntryPage() {
  const params = useParams();
  const [entry, setEntry] = useState<BlogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntry();
  }, [params.slug]);

  const loadEntry = async () => {
    try {
      const res = await apiClient.get<BlogEntry>(`/blog/${params.slug}`);
      setEntry(res.data);
    } catch (err: any) {
      setError(err.message || 'Eintrag nicht gefunden');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  if (error || !entry) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck zum Blog
          </Button>
        </Link>
        <Card>
          <CardContent className="py-8 text-center text-red-600">
            {error || 'Eintrag nicht gefunden'}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/blog">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurueck zum Blog
        </Button>
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{entry.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
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
          </div>
        </header>

        <div
          className="prose prose-green max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </article>
    </div>
  );
}
