'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { useToast } from '@/lib/hooks/use-toast';
import { createBlogEntryAction, updateBlogEntryAction } from '@/lib/actions/blog';

interface BlogFormProps {
  entry?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    status: 'DRAFT' | 'PUBLISHED';
  };
}

export function BlogForm({ entry }: BlogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(entry?.title || '');
  const [slug, setSlug] = useState(entry?.slug || '');
  const [excerpt, setExcerpt] = useState(entry?.excerpt || '');
  const [content, setContent] = useState(entry?.content || '');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/[ß]/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!entry) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        title,
        slug,
        excerpt: excerpt || undefined,
        content,
      };

      if (entry) {
        await updateBlogEntryAction(entry.id, data);
        toast({ title: 'Eintrag aktualisiert' });
      } else {
        await createBlogEntryAction(data);
        toast({ title: 'Eintrag erstellt' });
      }
      router.push('/admin/blog');
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Speichern',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grundinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Titel des Blogeintrags"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL-Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              Wird in der URL verwendet: /blog/{slug || 'url-slug'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Kurzfassung</Label>
            <Input
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Kurze Zusammenfassung fuer die Uebersicht"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inhalt *</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Schreibe deinen Blogeintrag hier..."
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-2">
            Nutze die Toolbar um Text zu formatieren und Bilder einzufuegen.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Wird gespeichert...'
            : entry
              ? 'Aktualisieren'
              : 'Als Entwurf speichern'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/blog')}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
