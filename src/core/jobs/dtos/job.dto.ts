import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber } from 'class-validator';

import { CommentDto } from './../../comments/dtos/comment.dto';
import { ProfileDto } from './../../profiles/dtos/profile.dto';
import { SkillDto } from '../../../core/skills/dtos/skill.dto';
import { ReactionDto } from '../../../core/reactions/dtos/reaction.dto';
import { JobStatus } from '../jobs.constants';

export class JobDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  website: string;

  @Expose()
  application_url: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  deadline: Date;

  @Expose()
  location: string;

  @Expose()
  views: string;

  @Expose()
  @IsEnum(JobStatus)
  status: JobStatus;

  @Expose()
  @IsArray()
  @Type(() => SkillDto)
  skills: SkillDto[];

  @Expose()
  @IsArray()
  @Type(() => CommentDto)
  comments: CommentDto[];

  @Expose()
  @IsArray()
  @Type(() => ReactionDto)
  reactions: ReactionDto[];

  @Expose()
  @Transform(({ obj }) => {
    if (obj.owner) {
      return {
        first_name: obj.owner?.first_name,
        last_name: obj.owner?.last_name,
        id: obj.owner?.uuid,
        email: obj.owner?.email,
        avatar: obj.owner?.avatar,
      };
    } else {
      return null;
    }
  })
  @Type(() => ProfileDto)
  owner: ProfileDto;
}

export class PaginatedJobDto {
  @Expose()
  @IsArray()
  @Type(() => JobDto)
  data: JobDto[];

  @Expose()
  @IsNumber()
  total: number;

  @Expose()
  @IsNumber()
  totalPages: number;

  @Expose()
  @IsNumber()
  page: number;

  @Expose()
  @IsNumber()
  perPage: number;
}

export class LimitedJobDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  created_at: Date;

  @Expose()
  website: string;

  @Expose()
  application_url: string;

  @Expose()
  @IsArray()
  @Type(() => SkillDto)
  skills: SkillDto[];

  @Expose()
  @IsEnum(JobStatus)
  status: JobStatus;

  @Expose()
  @IsArray()
  @Type(() => CommentDto)
  comments: CommentDto[];

  @Expose()
  @IsArray()
  @Type(() => ReactionDto)
  reactions: ReactionDto[];
}

export class PaginatedLimitedJobDto {
  @Expose()
  @IsArray()
  @Type(() => LimitedJobDto)
  data: LimitedJobDto[];

  @Expose()
  @IsNumber()
  total: number;

  @Expose()
  @IsNumber()
  totalPages: number;

  @Expose()
  @IsNumber()
  page: number;

  @Expose()
  @IsNumber()
  perPage: number;
}
