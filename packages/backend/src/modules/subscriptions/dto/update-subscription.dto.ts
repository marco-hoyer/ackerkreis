import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  distributionCenterId?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'CANCELLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
}
