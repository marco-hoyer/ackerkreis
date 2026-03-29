import { Module } from '@nestjs/common';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';
import { VotingStatsService } from './voting-stats.service';

@Module({
  controllers: [VotingController],
  providers: [VotingService, VotingStatsService],
  exports: [VotingService],
})
export class VotingModule {}
