'use server';

import { requireAdmin, requireUser } from '@/lib/auth/session';
import {
  createVotingRound,
  openVotingRound,
  closeVotingRound,
  submitVote,
  type CreateVotingRoundInput,
} from '@/lib/services/voting';
import { revalidatePath } from 'next/cache';

export async function createVotingRoundAction(input: CreateVotingRoundInput) {
  await requireAdmin();
  const round = await createVotingRound(input);
  revalidatePath('/admin/voting');
  return round;
}

export async function openVotingRoundAction(id: string) {
  await requireAdmin();
  const round = await openVotingRound(id);
  revalidatePath('/admin/voting');
  revalidatePath('/voting');
  return round;
}

export async function closeVotingRoundAction(id: string) {
  await requireAdmin();
  const round = await closeVotingRound(id);
  revalidatePath('/admin/voting');
  revalidatePath('/voting');
  return round;
}

export async function submitVoteAction(amount: number) {
  const user = await requireUser();

  if (!user.subscriptionId) {
    throw new Error('Kein Abonnement zugewiesen');
  }

  const vote = await submitVote(user.id, user.subscriptionId, amount);
  revalidatePath('/voting');
  return vote;
}
