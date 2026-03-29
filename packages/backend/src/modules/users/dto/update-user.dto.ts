import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein' })
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['MEMBER', 'ADMIN'], { message: 'Rolle muss MEMBER oder ADMIN sein' })
  role?: 'MEMBER' | 'ADMIN';

  @IsOptional()
  @IsString()
  subscriptionId?: string | null;
}
