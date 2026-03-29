import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionIdGenerator {
  constructor(private prisma: PrismaService) {}

  async generateNext(): Promise<string> {
    const lastSubscription = await this.prisma.subscription.findFirst({
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
}
