import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVotingRoundDto } from './dto/create-voting-round.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class VotingService {
  constructor(private prisma: PrismaService) {}

  async findAllRounds() {
    return this.prisma.votingRound.findMany({
      orderBy: { year: 'desc' },
    });
  }

  async findRound(id: string) {
    const round = await this.prisma.votingRound.findUnique({
      where: { id },
      include: { votes: true },
    });

    if (!round) {
      throw new NotFoundException('Abstimmungsrunde nicht gefunden');
    }

    return round;
  }

  async getCurrentRound() {
    return this.prisma.votingRound.findFirst({
      where: { status: 'OPEN' },
    });
  }

  async createRound(dto: CreateVotingRoundDto) {
    // Check if round for this year already exists
    const existing = await this.prisma.votingRound.findUnique({
      where: { year: dto.year },
    });

    if (existing) {
      throw new BadRequestException(`Abstimmungsrunde fuer ${dto.year} existiert bereits`);
    }

    return this.prisma.votingRound.create({
      data: {
        year: dto.year,
        targetIncome: new Decimal(dto.targetIncome),
        status: 'DRAFT',
      },
    });
  }

  async openRound(id: string) {
    const round = await this.findRound(id);

    if (round.status !== 'DRAFT') {
      throw new BadRequestException('Nur Entwuerfe koennen geoeffnet werden');
    }

    // Close any other open rounds
    await this.prisma.votingRound.updateMany({
      where: { status: 'OPEN' },
      data: { status: 'CLOSED' },
    });

    return this.prisma.votingRound.update({
      where: { id },
      data: {
        status: 'OPEN',
        startDate: new Date(),
      },
    });
  }

  async closeRound(id: string) {
    const round = await this.findRound(id);

    if (round.status !== 'OPEN') {
      throw new BadRequestException('Nur offene Runden koennen geschlossen werden');
    }

    return this.prisma.votingRound.update({
      where: { id },
      data: {
        status: 'CLOSED',
        endDate: new Date(),
      },
    });
  }

  async submitVote(userId: string, subscriptionId: string, dto: SubmitVoteDto) {
    const round = await this.getCurrentRound();

    if (!round) {
      throw new BadRequestException('Keine offene Abstimmungsrunde');
    }

    // Check if subscription already voted
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        subscriptionId_votingRoundId: {
          subscriptionId,
          votingRoundId: round.id,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      return this.prisma.vote.update({
        where: { id: existingVote.id },
        data: {
          amount: new Decimal(dto.amount),
          userId,
        },
      });
    }

    // Create new vote
    return this.prisma.vote.create({
      data: {
        subscriptionId,
        userId,
        votingRoundId: round.id,
        amount: new Decimal(dto.amount),
      },
    });
  }

  async getMyVote(userId: string, roundId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.subscriptionId) {
      return null;
    }

    return this.prisma.vote.findUnique({
      where: {
        subscriptionId_votingRoundId: {
          subscriptionId: user.subscriptionId,
          votingRoundId: roundId,
        },
      },
    });
  }
}
