import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  distributionCenterId: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'CANCELLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
}
