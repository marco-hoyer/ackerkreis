import { db } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import type { Vote } from '@prisma/client';

export interface CreateVotingRoundInput {
  year: number;
  targetIncome: number;
}

export async function getVotingRounds() {
  return db.votingRound.findMany({
    orderBy: { year: 'desc' },
  });
}

export async function getVotingRound(id: string) {
  const round = await db.votingRound.findUnique({
    where: { id },
    include: { votes: true },
  });

  if (!round) {
    throw new Error('Abstimmungsrunde nicht gefunden');
  }

  return round;
}

export async function getCurrentVotingRound() {
  return db.votingRound.findFirst({
    where: { status: 'OPEN' },
  });
}

export async function createVotingRound(input: CreateVotingRoundInput) {
  const existing = await db.votingRound.findUnique({
    where: { year: input.year },
  });

  if (existing) {
    throw new Error(`Abstimmungsrunde fuer ${input.year} existiert bereits`);
  }

  return db.votingRound.create({
    data: {
      year: input.year,
      targetIncome: new Decimal(input.targetIncome),
      status: 'DRAFT',
    },
  });
}

export async function openVotingRound(id: string) {
  const round = await getVotingRound(id);

  if (round.status !== 'DRAFT') {
    throw new Error('Nur Entwuerfe koennen geoeffnet werden');
  }

  await db.votingRound.updateMany({
    where: { status: 'OPEN' },
    data: { status: 'CLOSED' },
  });

  return db.votingRound.update({
    where: { id },
    data: {
      status: 'OPEN',
      startDate: new Date(),
    },
  });
}

export async function closeVotingRound(id: string) {
  const round = await getVotingRound(id);

  if (round.status !== 'OPEN') {
    throw new Error('Nur offene Runden koennen geschlossen werden');
  }

  return db.votingRound.update({
    where: { id },
    data: {
      status: 'CLOSED',
      endDate: new Date(),
    },
  });
}

export async function submitVote(userId: string, subscriptionId: string, amount: number) {
  const round = await getCurrentVotingRound();

  if (!round) {
    throw new Error('Keine offene Abstimmungsrunde');
  }

  const existingVote = await db.vote.findUnique({
    where: {
      subscriptionId_votingRoundId: {
        subscriptionId,
        votingRoundId: round.id,
      },
    },
  });

  if (existingVote) {
    return db.vote.update({
      where: { id: existingVote.id },
      data: {
        amount: new Decimal(amount),
        userId,
      },
    });
  }

  return db.vote.create({
    data: {
      subscriptionId,
      userId,
      votingRoundId: round.id,
      amount: new Decimal(amount),
    },
  });
}

export async function getMyVote(userId: string, roundId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user?.subscriptionId) {
    return null;
  }

  return db.vote.findUnique({
    where: {
      subscriptionId_votingRoundId: {
        subscriptionId: user.subscriptionId,
        votingRoundId: roundId,
      },
    },
  });
}

export interface VotingStats {
  targetIncome: number;
  totalVotedMonthly: number;
  totalVotedYearly: number;
  percentageReached: number;
  totalSubscriptions: number;
  votedSubscriptions: number;
  remainingSubscriptions: number;
  isComplete: boolean;
  averageMonthlyVote: number;
}

export async function getVotingStats(roundId: string): Promise<VotingStats> {
  const round = await db.votingRound.findUnique({
    where: { id: roundId },
    include: { votes: true },
  });

  if (!round) {
    throw new Error('Abstimmungsrunde nicht gefunden');
  }

  const totalVotedMonthly = round.votes.reduce(
    (sum: Decimal, vote: Vote) => sum.add(vote.amount),
    new Decimal(0)
  );

  const totalVotedYearly = totalVotedMonthly.mul(12);

  const percentageReached = round.targetIncome.isZero()
    ? 0
    : totalVotedYearly.div(round.targetIncome).mul(100).toNumber();

  const totalSubscriptions = await db.subscription.count({
    where: { status: 'ACTIVE' },
  });

  const votedSubscriptions = round.votes.length;
  const remainingSubscriptions = totalSubscriptions - votedSubscriptions;

  const averageMonthlyVote =
    votedSubscriptions > 0 ? totalVotedMonthly.div(votedSubscriptions).toNumber() : 0;

  return {
    targetIncome: round.targetIncome.toNumber(),
    totalVotedMonthly: totalVotedMonthly.toNumber(),
    totalVotedYearly: totalVotedYearly.toNumber(),
    percentageReached,
    totalSubscriptions,
    votedSubscriptions,
    remainingSubscriptions,
    isComplete: percentageReached >= 100,
    averageMonthlyVote,
  };
}
