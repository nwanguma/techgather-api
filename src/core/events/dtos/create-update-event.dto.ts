import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsUrl,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { EventTypes } from '../events.constants';

export class CreateOrUpdateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  website?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  location?: string;

  @IsBoolean()
  @IsOptional()
  requires_feedback?: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  feedback_guide?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  attachment?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(EventTypes)
  type?: EventTypes;

  @IsOptional()
  @IsString()
  @IsUrl()
  banner?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  ticket_link?: string;

  @IsNotEmpty()
  @IsDateString()
  event_start_date: string;

  @IsNotEmpty()
  @IsDateString()
  event_end_date: string;
}
