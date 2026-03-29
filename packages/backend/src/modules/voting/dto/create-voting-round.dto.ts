import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateVotingRoundDto {
  @IsInt()
  @Min(2024)
  year: number;

  @IsNumber()
  @Min(0)
  targetIncome: number;
}
