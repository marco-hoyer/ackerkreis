import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/forms/user-form';
import { getUser } from '@/lib/services/users';
import { requireAdmin } from '@/lib/auth/session';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  let user;
  try {
    user = await getUser(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurueck
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold">Benutzer bearbeiten</h1>
      <p className="text-gray-500">{user.email}</p>

      <UserForm user={user} />
    </div>
  );
}
