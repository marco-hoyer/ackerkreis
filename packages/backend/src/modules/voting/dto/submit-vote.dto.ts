import { IsNumber, Min } from 'class-validator';

export class SubmitVoteDto {
  @IsNumber()
  @Min(0, { message: 'Der Betrag muss positiv sein' })
  amount: number;
}
