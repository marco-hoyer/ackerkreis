import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

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

@Injectable()
export class VotingStatsService {
  constructor(private prisma: PrismaService) {}

  async calculateRoundStats(roundId: string): Promise<VotingStats> {
    const round = await this.prisma.votingRound.findUnique({
      where: { id: roundId },
      include: { votes: true },
    });

    if (!round) {
      throw new Error('Abstimmungsrunde nicht gefunden');
    }

    const totalVotedMonthly = round.votes.reduce(
      (sum, vote) => sum.add(vote.amount),
      new Decimal(0),
    );

    const totalVotedYearly = totalVotedMonthly.mul(12);

    const percentageReached = round.targetIncome.isZero()
      ? 0
      : totalVotedYearly.div(round.targetIncome).mul(100).toNumber();

    const totalSubscriptions = await this.prisma.subscription.count({
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
}
