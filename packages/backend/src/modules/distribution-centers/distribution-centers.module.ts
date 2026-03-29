import { Module } from '@nestjs/common';
import { DistributionCentersController } from './distribution-centers.controller';
import { DistributionCentersService } from './distribution-centers.service';

@Module({
  controllers: [DistributionCentersController],
  providers: [DistributionCentersService],
  exports: [DistributionCentersService],
})
export class DistributionCentersModule {}
