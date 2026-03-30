import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getBlogEntryBySlug } from '@/lib/services/blog';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogEntryPage({ params }: PageProps) {
  const { slug } = await params;

  let entry;
  try {
    entry = await getBlogEntryBySlug(slug);
  } catch {
    notFound();
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
            {entry.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(entry.publishedAt).toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
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
