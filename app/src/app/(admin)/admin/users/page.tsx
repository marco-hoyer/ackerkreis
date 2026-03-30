import { getUsers } from '@/lib/services/users';
import { requireAdmin } from '@/lib/auth/session';
import { UsersTable } from './users-table';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const result = await getUsers(page, 20);

  return (
    <div className="space-y-6">
      <UsersTable
        initialUsers={result.data}
        pagination={result.pagination}
        currentPage={page}
      />
    </div>
  );
}
