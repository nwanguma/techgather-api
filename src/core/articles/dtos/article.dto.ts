import { IsArray, IsNumber } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { LimitedProfileDto } from '../../profiles/dtos/profile.dto';
import { CommentDto, LimitedCommentDto } from '../../comments/dtos/comment.dto';
import {
  LimitedReactionDto,
  ReactionDto,
} from '../../reactions/dtos/reaction.dto';

export class ArticleDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  title: string;

  @Expose()
  body: string;

  @Expose()
  views: number;

  @Expose()
  banner: string;

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
  @Type(() => ReactionDto)
  reactions: ReactionDto[];
}

export class PaginatedArticleDto {
  @Expose()
  @IsArray()
  @Type(() => ArticleDto)
  data: ArticleDto[];

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

export class LimitedArticleDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  title: string;

  @Expose()
  body: string;

  @Expose()
  banner: string;

  @Expose()
  created_at: Date;

  @Expose()
  @Type(() => LimitedProfileDto)
  owner: LimitedProfileDto;

  @Expose()
  @IsArray()
  @Type(() => LimitedCommentDto)
  comments: LimitedCommentDto[];

  @Expose()
  @IsArray()
  @Type(() => LimitedReactionDto)
  reactions: LimitedReactionDto[];
}

export class PaginatedLimitedArticleDto {
  @Expose()
  @IsArray()
  @Type(() => LimitedArticleDto)
  data: LimitedArticleDto[];

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
