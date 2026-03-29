import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionMatcherService {
  // Pattern to match subscription IDs (S0001 - S9999)
  private readonly subscriptionIdPattern = /S\d{4}/gi;

  constructor(private prisma: PrismaService) {}

  /**
   * Extract subscription ID from transaction description
   * Returns null if no valid subscription ID found
   */
  async matchTransaction(description: string): Promise<string | null> {
    const matches = description.match(this.subscriptionIdPattern);

    if (!matches || matches.length === 0) {
      return null;
    }

    // Normalize to uppercase
    const potentialId = matches[0].toUpperCase();

    // Verify subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { subscriptionId: potentialId },
    });

    return subscription ? subscription.id : null;
  }

  /**
   * Match multiple transactions in batch
   */
  async matchTransactions(
    descriptions: string[],
  ): Promise<Map<number, string | null>> {
    const results = new Map<number, string | null>();

    // Get all subscription IDs for faster lookup
    const subscriptions = await this.prisma.subscription.findMany({
      select: { id: true, subscriptionId: true },
    });

    const subscriptionMap = new Map<string, string>(
      subscriptions.map((s: { id: string; subscriptionId: string }) => [s.subscriptionId, s.id]),
    );

    for (let i = 0; i < descriptions.length; i++) {
      const description = descriptions[i];
      const matches = description.match(this.subscriptionIdPattern);

      if (matches && matches.length > 0) {
        const potentialId = matches[0].toUpperCase();
        const subscriptionDbId = subscriptionMap.get(potentialId);
        results.set(i, subscriptionDbId || null);
      } else {
        results.set(i, null);
      }
    }

    return results;
  }
}
