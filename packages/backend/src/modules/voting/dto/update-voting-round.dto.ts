import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateVotingRoundDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetIncome?: number;
}
