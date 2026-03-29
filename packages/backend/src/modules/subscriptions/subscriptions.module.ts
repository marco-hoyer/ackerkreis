import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionIdGenerator } from './subscription-id.generator';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionIdGenerator],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
