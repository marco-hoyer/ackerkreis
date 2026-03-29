import { IsEmail } from 'class-validator';

export class RequestMagicLinkDto {
  @IsEmail({}, { message: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein' })
  email: string;
}
