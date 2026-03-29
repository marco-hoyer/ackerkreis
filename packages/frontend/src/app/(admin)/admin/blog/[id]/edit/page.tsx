'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BlogForm } from '@/components/forms/blog-form';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft } from 'lucide-react';

interface BlogEntry {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export default function EditBlogEntryPage() {
  const params = useParams();
  const [entry, setEntry] = useState<BlogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntry();
  }, [params.id]);

  const loadEntry = async () => {
    try {
      // Get all entries and find by ID (since we need the full content)
      const res = await apiClient.get<{ data: BlogEntry[] }>('/blog/admin?limit=1000');
      const found = res.data.data.find((e) => e.id === params.id);
      if (found) {
        // Fetch full content by slug
        const fullRes = await apiClient.get<BlogEntry>(`/blog/${found.slug}`);
        setEntry({ ...fullRes.data, status: found.status });
      } else {
        setError('Eintrag nicht gefunden');
      }
    } catch (err: any) {
      setError(err.message || 'Eintrag nicht gefunden');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-8">Laden...</div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurueck
            </Button>
          </Link>
        </div>
        <div className="text-center py-8 text-red-600">
          {error || 'Eintrag nicht gefunden'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/admin/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Blogeintrag bearbeiten</h1>
        <p className="text-gray-500">{entry.title}</p>
      </div>

      <BlogForm entry={entry} />
    </div>
  );
}
