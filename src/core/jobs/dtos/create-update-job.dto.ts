import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateSkillDto } from '../../skills/dtos/create-skill.dto';
import { JobStatus } from '../jobs.constants';

export class CreateOrUpdateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  website: string;

  @IsString()
  application_url?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @IsArray()
  skills?: CreateSkillDto[];
}
