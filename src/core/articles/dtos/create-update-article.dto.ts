import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateOrUpdateArticleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  banner?: string;
}
