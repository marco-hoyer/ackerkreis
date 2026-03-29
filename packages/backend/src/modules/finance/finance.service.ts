import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CsvParserService } from './csv-parser.service';
import { TransactionMatcherService } from './transaction-matcher.service';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';
import type { Vote, BankTransaction } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private csvParser: CsvParserService,
    private transactionMatcher: TransactionMatcherService,
  ) {}

  async importTransactions(csvContent: string) {
    const parsed = this.csvParser.parse(csvContent);
    const importBatchId = uuidv4();

    // Match all transactions
    const descriptions = parsed.map((t) => t.description);
    const matches = await this.transactionMatcher.matchTransactions(descriptions);

    // Create transactions
    const transactions = await Promise.all(
      parsed.map(async (t, index) => {
        const subscriptionId = matches.get(index) || null;

        return this.prisma.bankTransaction.create({
          data: {
            date: t.date,
            amount: new Decimal(t.amount),
            description: t.description,
            subscriptionId,
            matched: !!subscriptionId,
            importBatchId,
          },
          include: { subscription: true },
        });
      }),
    );

    const matchedCount = transactions.filter((t) => t.matched).length;

    return {
      importBatchId,
      total: transactions.length,
      matched: matchedCount,
      unmatched: transactions.length - matchedCount,
      transactions,
    };
  }

  async getTransactions(page: number, limit: number, matched?: boolean) {
    const skip = (page - 1) * limit;
    const where = matched !== undefined ? { matched } : {};

    const [transactions, total] = await Promise.all([
      this.prisma.bankTransaction.findMany({
        where,
        skip,
        take: limit,
        include: { subscription: true },
        orderBy: { date: 'desc' },
      }),
      this.prisma.bankTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnmatchedTransactions(page: number, limit: number) {
    return this.getTransactions(page, limit, false);
  }

  async manualMatch(transactionId: string, subscriptionIdInput: string) {
    const transaction = await this.prisma.bankTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaktion nicht gefunden');
    }

    // Look up subscription by human-readable ID (e.g., "S0001")
    const subscription = await this.prisma.subscription.findUnique({
      where: { subscriptionId: subscriptionIdInput.toUpperCase() },
    });

    if (!subscription) {
      throw new NotFoundException(`Abonnement ${subscriptionIdInput} nicht gefunden`);
    }

    return this.prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        subscriptionId: subscription.id,
        matched: true,
      },
      include: { subscription: true },
    });
  }

  async getStatistics(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01`);
    const endDate = new Date(`${targetYear + 1}-01-01`);

    // Get voting round for expected income
    const votingRound = await this.prisma.votingRound.findUnique({
      where: { year: targetYear },
      include: { votes: true },
    });

    const expectedMonthly = votingRound
      ? votingRound.votes.reduce((sum: Decimal, v: Vote) => sum.add(v.amount), new Decimal(0))
      : new Decimal(0);

    const currentMonth = new Date().getMonth() + 1;
    const monthsElapsed = targetYear === new Date().getFullYear() ? currentMonth : 12;
    const expectedToDate = expectedMonthly.mul(monthsElapsed);

    // Get all transactions for this year
    const [matchedTransactions, unmatchedTransactions] = await Promise.all([
      this.prisma.bankTransaction.findMany({
        where: {
          date: { gte: startDate, lt: endDate },
          matched: true,
        },
      }),
      this.prisma.bankTransaction.count({
        where: {
          date: { gte: startDate, lt: endDate },
          matched: false,
        },
      }),
    ]);

    const actualIncome = matchedTransactions.reduce(
      (sum: Decimal, t: BankTransaction) => sum.add(t.amount),
      new Decimal(0),
    );

    const matchedCount = matchedTransactions.length;
    const transactionCount = matchedCount + unmatchedTransactions;

    return {
      totalIncome: actualIncome.toNumber(),
      expectedIncome: expectedToDate.toNumber(),
      difference: actualIncome.sub(expectedToDate).toNumber(),
      transactionCount,
      matchedCount,
      unmatchedCount: unmatchedTransactions,
    };
  }

  async getNegativeBalances() {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);

    // Get all active subscriptions with their votes
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        votes: {
          where: { votingRound: { year: currentYear } },
        },
        transactions: {
          where: { date: { gte: startDate } },
        },
      },
    });

    const currentMonth = new Date().getMonth() + 1;
    const negativeBalances = [];

    for (const subscription of subscriptions) {
      const monthlyAmount = subscription.votes[0]?.amount || new Decimal(0);
      const expectedAmount = monthlyAmount.mul(currentMonth);
      const totalPaid = subscription.transactions.reduce(
        (sum: Decimal, t: BankTransaction) => sum.add(t.amount),
        new Decimal(0),
      );
      const balance = totalPaid.sub(expectedAmount);

      if (balance.isNegative()) {
        negativeBalances.push({
          subscriptionId: subscription.subscriptionId,
          id: subscription.id,
          monthlyAmount: monthlyAmount.toNumber(),
          expectedAmount: expectedAmount.toNumber(),
          totalPaid: totalPaid.toNumber(),
          balance: balance.toNumber(),
        });
      }
    }

    return negativeBalances.sort((a, b) => a.balance - b.balance);
  }
}
