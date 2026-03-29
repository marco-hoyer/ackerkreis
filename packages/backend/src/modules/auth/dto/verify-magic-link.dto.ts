import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyMagicLinkDto {
  @IsEmail({}, { message: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'Der Code muss 6 Zeichen lang sein' })
  code: string;
}
