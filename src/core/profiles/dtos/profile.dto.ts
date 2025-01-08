import { FollowingDto } from './../../followers/dtos/follower-following.dto';
import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber } from 'class-validator';

import { Language, ProfileStatus } from '../profiles.constants';
import { SkillDto } from '../../skills/dtos/skill.dto';
import { CommentDto } from '../../../core/comments/dtos/comment.dto';
import { ReactionDto } from '../../../core/reactions/dtos/reaction.dto';
import { LimitedJobDto } from '../../jobs/dtos/job.dto';
import { LimitedEventDto } from '../../events/dtos/event.dto';
import { LimitedArticleDto } from '../../articles/dtos/article.dto';
import { FollowerDto } from '../../followers/dtos/follower-following.dto';

export class ProfileDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  email: string;

  @Expose()
  avatar: string;

  @Expose()
  bio: string;

  @Expose()
  heading: string;

  @Expose()
  title: string;

  @Expose()
  views: number;

  @Expose()
  location: string;

  @Expose()
  phone: string;

  @Expose()
  is_mentor?: boolean;

  @Expose()
  mentor_note?: string;

  @Expose()
  website: string;

  @Expose()
  linkedin: string;

  @Expose()
  @Transform(({ obj }) => obj.user_uuid)
  user_id: string;

  @Expose()
  github: string;

  @Expose()
  resume: string;

  @Expose()
  @IsArray()
  @Type(() => FollowerDto)
  followers: FollowerDto[];

  @Expose()
  @IsArray()
  @Type(() => FollowingDto)
  following: FollowingDto[];

  @Expose()
  languages: Language[];

  @Expose()
  @IsArray()
  @Type(() => SkillDto)
  skills: SkillDto[];

  @Expose()
  @IsEnum(ProfileStatus)
  status?: ProfileStatus;

  @Expose()
  @IsArray()
  @Type(() => LimitedEventDto)
  events: LimitedEventDto[];

  @Expose()
  @IsArray()
  @Type(() => LimitedJobDto)
  jobs: LimitedJobDto[];

  @Expose()
  @IsArray()
  @Type(() => LimitedArticleDto)
  articles: LimitedArticleDto[];

  @Expose()
  @Transform(({ obj }) => {
    return !obj.title && !obj.location;
  })
  requires_update: boolean;

  @Expose()
  @Transform(({ obj }) =>
    obj.profile_reactions?.map((reaction) => ({
      id: reaction.uuid,
      created_at: reaction.created_at,
      owner: {
        id: reaction.owner.uuid,
        avatar: reaction.owner.avatar,
        first_name: reaction.owner.first_name,
        last_name: reaction.owner.last_name,
        email: reaction.owner.email,
        user_id: reaction.owner.user_uuid,
      },
    })),
  )
  @IsArray()
  @Type(() => ReactionDto)
  reactions: ReactionDto[];

  @Expose()
  @Transform(({ obj }) =>
    obj.profile_comments?.map((comment) => ({
      id: comment.uuid,
      text: comment.text,
      created_at: comment.created_at,
      owner: {
        id: comment.owner.uuid,
        avatar: comment.owner.avatar,
        first_name: comment.owner.first_name,
        last_name: comment.owner.last_name,
        email: comment.owner.email,
        user_id: comment.owner.user_uuid,
      },
    })),
  )
  @IsArray()
  @Type(() => CommentDto)
  comments: CommentDto[];
}

export class PaginatedProfileDto {
  @Expose()
  @IsArray()
  @Type(() => ProfileDto)
  data: ProfileDto[];

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

export class LimitedProfileDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  email: string;

  @Expose()
  bio: string;

  @Expose()
  avatar: string;

  @Expose()
  title: string;

  @Expose()
  heading: string;

  @Expose()
  @IsArray()
  @Type(() => SkillDto)
  skills: SkillDto[];

  @Expose()
  @Transform(({ obj }) => obj.user_uuid)
  user_id: string;
}

export class PaginatedLimitedProfileDto {
  @Expose()
  @IsArray()
  @Type(() => LimitedProfileDto)
  data: LimitedProfileDto[];

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
