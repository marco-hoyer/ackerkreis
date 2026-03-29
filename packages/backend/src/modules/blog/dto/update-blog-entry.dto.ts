import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateBlogEntryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Titel muss mindestens 3 Zeichen haben' })
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Inhalt muss mindestens 10 Zeichen haben' })
  content?: string;
}
