import { db } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import type { SubscriptionStatus, BankTransaction } from '@prisma/client';

export interface CreateSubscriptionInput {
  distributionCenterId: string;
  status?: SubscriptionStatus;
}

export interface UpdateSubscriptionInput {
  distributionCenterId?: string;
  status?: SubscriptionStatus;
}

async function generateNextSubscriptionId(): Promise<string> {
  const lastSubscription = await db.subscription.findFirst({
    orderBy: { subscriptionId: 'desc' },
    select: { subscriptionId: true },
  });

  if (!lastSubscription) {
    return 'S0001';
  }

  const lastNumber = parseInt(lastSubscription.subscriptionId.slice(1), 10);
  const nextNumber = lastNumber + 1;

  if (nextNumber > 9999) {
    throw new Error('Abonnement-ID Limit erreicht (max S9999)');
  }

  return `S${nextNumber.toString().padStart(4, '0')}`;
}

export async function getSubscriptions(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [subscriptions, total] = await Promise.all([
    db.subscription.findMany({
      skip,
      take: limit,
      include: { distributionCenter: true, users: true },
      orderBy: { subscriptionId: 'asc' },
    }),
    db.subscription.count(),
  ]);

  return {
    data: subscriptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getSubscription(id: string) {
  const subscription = await db.subscription.findUnique({
    where: { id },
    include: { distributionCenter: true, users: true },
  });

  if (!subscription) {
    throw new Error('Abonnement nicht gefunden');
  }

  return subscription;
}

export async function getSubscriptionBySubscriptionId(subscriptionId: string) {
  return db.subscription.findUnique({
    where: { subscriptionId },
    include: { distributionCenter: true, users: true },
  });
}

export async function createSubscription(input: CreateSubscriptionInput) {
  const subscriptionId = await generateNextSubscriptionId();

  return db.subscription.create({
    data: {
      subscriptionId,
      distributionCenterId: input.distributionCenterId,
      status: input.status || 'ACTIVE',
    },
    include: { distributionCenter: true },
  });
}

export async function updateSubscription(id: string, input: UpdateSubscriptionInput) {
  await getSubscription(id);

  return db.subscription.update({
    where: { id },
    data: {
      ...(input.distributionCenterId && { distributionCenterId: input.distributionCenterId }),
      ...(input.status && { status: input.status }),
    },
    include: { distributionCenter: true, users: true },
  });
}

export async function deleteSubscription(id: string) {
  await getSubscription(id);
  await db.subscription.delete({ where: { id } });
  return { message: 'Abonnement geloescht' };
}

export async function getSubscriptionBalance(id: string) {
  const subscription = await getSubscription(id);

  const currentYear = new Date().getFullYear();
  let vote = await db.vote.findFirst({
    where: {
      subscriptionId: id,
      votingRound: { year: currentYear },
    },
    include: { votingRound: true },
  });

  if (!vote) {
    vote = await db.vote.findFirst({
      where: {
        subscriptionId: id,
        votingRound: { year: currentYear + 1 },
      },
      include: { votingRound: true },
    });
  }

  if (!vote) {
    vote = await db.vote.findFirst({
      where: { subscriptionId: id },
      orderBy: { createdAt: 'desc' },
      include: { votingRound: true },
    });
  }

  const transactions = await db.bankTransaction.findMany({
    where: {
      subscriptionId: id,
      date: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
      },
    },
  });

  const totalPaid = transactions.reduce(
    (sum: Decimal, t: BankTransaction) => sum.add(t.amount),
    new Decimal(0)
  );

  const monthlyAmount = vote?.amount || new Decimal(0);
  const monthsElapsed = new Date().getMonth() + 1;
  const expectedAmount = monthlyAmount.mul(monthsElapsed);
  const balance = totalPaid.sub(expectedAmount);

  return {
    subscriptionId: subscription.subscriptionId,
    monthlyAmount: monthlyAmount.toNumber(),
    expectedAmount: expectedAmount.toNumber(),
    totalPaid: totalPaid.toNumber(),
    balance: balance.toNumber(),
    transactions: transactions.length,
  };
}
