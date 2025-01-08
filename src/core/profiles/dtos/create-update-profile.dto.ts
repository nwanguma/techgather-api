import { ProfileStatus, VisibilityStatus } from './../profiles.constants';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

import { Language } from '../profiles.constants';
import { CreateSkillDto } from '../../skills/dtos/create-skill.dto';

export class CreateOrUpdateProfileDto {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  heading?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;

  @IsString()
  @IsOptional()
  github?: string;

  @IsString()
  @IsOptional()
  mentor_note?: string;

  @IsBoolean()
  @IsOptional()
  is_mentor?: boolean;

  @IsString()
  @IsOptional()
  resume?: string;

  @IsEnum(ProfileStatus)
  @IsOptional()
  status?: ProfileStatus;

  @IsEnum(VisibilityStatus)
  @IsOptional()
  visibility_status?: VisibilityStatus;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Language, { each: true })
  @IsOptional()
  languages?: Language[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillDto)
  @IsOptional()
  skills?: CreateSkillDto[];
}
