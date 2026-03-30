import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BlogForm } from '@/components/forms/blog-form';
import { getBlogEntry } from '@/lib/services/blog';
import { requireAdmin } from '@/lib/auth/session';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogEntryPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  let entry;
  try {
    entry = await getBlogEntry(id);
  } catch {
    notFound();
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

      <BlogForm entry={{
        id: entry.id,
        title: entry.title,
        slug: entry.slug,
        excerpt: entry.excerpt ?? undefined,
        content: entry.content,
        status: entry.status,
      }} />
    </div>
  );
}
