import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPublishedBlogEntries } from '@/lib/services/blog';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const result = await getPublishedBlogEntries(page, 10);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-gray-600 mt-2">Neuigkeiten und Updates von der Solawi</p>
      </div>

      {result.data.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Blog-Eintraege vorhanden.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {result.data.map((entry) => (
            <Link key={entry.id} href={`/blog/${entry.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{entry.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
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

      {result.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Link href={`/blog?page=${page - 1}`}>
            <Button variant="outline" disabled={page === 1}>
              Zurueck
            </Button>
          </Link>
          <span className="flex items-center px-4 text-sm">
            Seite {page} von {result.pagination.totalPages}
          </span>
          <Link href={`/blog?page=${page + 1}`}>
            <Button variant="outline" disabled={page === result.pagination.totalPages}>
              Weiter
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
