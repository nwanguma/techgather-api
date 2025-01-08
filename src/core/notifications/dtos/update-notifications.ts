import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
