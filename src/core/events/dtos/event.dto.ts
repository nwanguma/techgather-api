import { IsArray, IsEnum, IsNumber } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { LimitedProfileDto } from '../../profiles/dtos/profile.dto';
import { CommentDto, LimitedCommentDto } from '../../comments/dtos/comment.dto';
import { EventTypes } from '../events.constants';
import { FeedbackDto } from '../../feedback/dtos/feedback.dto';
import {
  LimitedReactionDto,
  ReactionDto,
} from '../../reactions/dtos/reaction.dto';

export class EventDto {
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
  ticket_link: string;

  @Expose()
  location: string;

  @Expose()
  link: string;

  @Expose()
  requires_feedback: boolean;

  @Expose()
  feedback_guide: string;

  @IsEnum(EventTypes)
  @Expose()
  type: EventTypes;

  @Expose()
  views: number;

  @Expose()
  banner: string;

  @Expose()
  attachment?: string;

  @Expose()
  event_start_date: Date;

  @Expose()
  event_end_date: Date;

  @Expose()
  created_at: Date;

  @Expose()
  @Type(() => LimitedProfileDto)
  owner: LimitedProfileDto;

  @Expose()
  @IsArray()
  @Type(() => CommentDto)
  comments: CommentDto[];

  @Expose()
  @IsArray()
  @Type(() => FeedbackDto)
  feedback: FeedbackDto[];

  @Expose()
  @IsArray()
  @Type(() => ReactionDto)
  reactions: ReactionDto[];
}

export class PaginatedEventDto {
  @Expose()
  @IsArray()
  @Type(() => EventDto)
  data: EventDto[];

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

export class LimitedEventDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  banner: string;

  @IsEnum(EventTypes)
  @Expose()
  type: EventTypes;

  @Expose()
  location: string;

  @Expose()
  event_start_date: Date;

  @Expose()
  event_end_date: Date;

  @Expose()
  created_at: Date;

  @Expose()
  @IsArray()
  @Type(() => LimitedCommentDto)
  comments: LimitedCommentDto[];

  @Expose()
  @IsArray()
  @Type(() => LimitedReactionDto)
  reactions: LimitedReactionDto[];
}

export class PaginatedLimitedEventDto {
  @Expose()
  @IsArray()
  @Type(() => LimitedEventDto)
  data: LimitedEventDto[];

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
