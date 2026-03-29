import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Titel muss mindestens 3 Zeichen haben' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  ingredients?: string[];

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Anleitung muss mindestens 10 Zeichen haben' })
  instructions?: string;
}
