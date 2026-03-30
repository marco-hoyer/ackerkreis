'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BlogForm } from '@/components/forms/blog-form';
import { ArrowLeft } from 'lucide-react';

export default function NewBlogEntryPage() {
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

      <h1 className="text-3xl font-bold">Neuen Blogeintrag erstellen</h1>

      <BlogForm />
    </div>
  );
}
