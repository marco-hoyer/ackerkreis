import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @MinLength(2, { message: 'Name muss mindestens 2 Zeichen haben' })
  name: string;

  @IsEmail({}, { message: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(10, { message: 'Nachricht muss mindestens 10 Zeichen haben' })
  message: string;

  @IsString()
  distributionCenterId: string;
}
