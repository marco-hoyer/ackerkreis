'use server';

import { requireAdmin } from '@/lib/auth/session';
import { importTransactions, manualMatchTransaction } from '@/lib/services/finance';
import { revalidatePath } from 'next/cache';

export async function importTransactionsAction(csvContent: string) {
  await requireAdmin();
  const result = await importTransactions(csvContent);
  revalidatePath('/admin/finance');
  return result;
}

export async function manualMatchTransactionAction(transactionId: string, subscriptionId: string) {
  await requireAdmin();
  const transaction = await manualMatchTransaction(transactionId, subscriptionId);
  revalidatePath('/admin/finance');
  return transaction;
}
