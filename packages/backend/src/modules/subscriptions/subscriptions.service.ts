import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionIdGenerator } from './subscription-id.generator';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: SubscriptionIdGenerator,
  ) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: limit,
        include: { distributionCenter: true, users: true },
        orderBy: { subscriptionId: 'asc' },
      }),
      this.prisma.subscription.count(),
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

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: { distributionCenter: true, users: true },
    });

    if (!subscription) {
      throw new NotFoundException('Abonnement nicht gefunden');
    }

    return subscription;
  }

  async findBySubscriptionId(subscriptionId: string) {
    return this.prisma.subscription.findUnique({
      where: { subscriptionId },
      include: { distributionCenter: true, users: true },
    });
  }

  async create(dto: CreateSubscriptionDto) {
    const subscriptionId = await this.idGenerator.generateNext();

    return this.prisma.subscription.create({
      data: {
        subscriptionId,
        distributionCenterId: dto.distributionCenterId,
        status: dto.status || 'ACTIVE',
      },
      include: { distributionCenter: true },
    });
  }

  async update(id: string, dto: UpdateSubscriptionDto) {
    await this.findOne(id);

    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...(dto.distributionCenterId && { distributionCenterId: dto.distributionCenterId }),
        ...(dto.status && { status: dto.status }),
      },
      include: { distributionCenter: true, users: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.subscription.delete({ where: { id } });
    return { message: 'Abonnement geloescht' };
  }

  async getBalance(id: string) {
    const subscription = await this.findOne(id);

    // Get the most recent vote for this subscription (current or upcoming year)
    const currentYear = new Date().getFullYear();
    let vote = await this.prisma.vote.findFirst({
      where: {
        subscriptionId: id,
        votingRound: { year: currentYear },
      },
      include: { votingRound: true },
    });

    // If no vote for current year, check for next year (voting usually happens ahead)
    if (!vote) {
      vote = await this.prisma.vote.findFirst({
        where: {
          subscriptionId: id,
          votingRound: { year: currentYear + 1 },
        },
        include: { votingRound: true },
      });
    }

    // If still no vote, get the most recent vote
    if (!vote) {
      vote = await this.prisma.vote.findFirst({
        where: { subscriptionId: id },
        orderBy: { createdAt: 'desc' },
        include: { votingRound: true },
      });
    }

    // Get all transactions for this subscription this year
    const transactions = await this.prisma.bankTransaction.findMany({
      where: {
        subscriptionId: id,
        date: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    });

    const totalPaid = transactions.reduce(
      (sum, t) => sum.add(t.amount),
      new Decimal(0),
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
}
