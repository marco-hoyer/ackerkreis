import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DistributionCentersModule } from './modules/distribution-centers/distribution-centers.module';
import { VotingModule } from './modules/voting/voting.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { BlogModule } from './modules/blog/blog.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { FinanceModule } from './modules/finance/finance.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    DistributionCentersModule,
    VotingModule,
    ApplicationsModule,
    BlogModule,
    RecipesModule,
    FinanceModule,
    EmailModule,
  ],
})
export class AppModule {}
