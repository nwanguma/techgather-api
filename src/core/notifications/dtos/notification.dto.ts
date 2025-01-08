import { Expose, Type, Transform } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

import {
  NotificationTypes,
  NotificationCategories,
} from '../notifications.constant';
import { ResourceTypes } from '../../../common/constants/index.constants';
import { LimitedUserWithProfileDto } from '../../users/dtos/user.dto';
import { LimitedArticleDto } from '../../articles/dtos/article.dto';
import { LimitedProfileDto } from '../../profiles/dtos/profile.dto';
import { LimitedJobDto } from '../../jobs/dtos/job.dto';
import { LimitedEventDto } from '../../events/dtos/event.dto';

export class NotificationDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  @Type(() => LimitedUserWithProfileDto)
  initiator: LimitedUserWithProfileDto;

  @Expose()
  @Type(() => LimitedUserWithProfileDto)
  recipient: LimitedUserWithProfileDto;

  @Expose()
  @IsEnum(NotificationTypes, { each: true })
  @IsArray()
  type: NotificationTypes[];

  @Expose()
  @IsEnum(NotificationCategories)
  category: NotificationCategories;

  @Expose()
  @IsBoolean()
  is_read: boolean;

  @Expose()
  @IsOptional()
  @Type(() => LimitedArticleDto)
  article?: LimitedArticleDto;

  @Expose()
  @IsOptional()
  @Type(() => LimitedProfileDto)
  profile?: LimitedProfileDto;

  @Expose()
  @IsOptional()
  @Type(() => LimitedJobDto)
  job?: LimitedJobDto;

  @Expose()
  @IsOptional()
  @Type(() => LimitedEventDto)
  event?: LimitedEventDto;

  @Expose()
  @IsString()
  @IsOptional()
  content?: string;

  @Expose()
  @IsEnum(ResourceTypes)
  resource_type: ResourceTypes;

  @Expose()
  created_at: Date;
}

export class PaginatedNotificationDto {
  @Expose()
  @IsArray()
  @Type(() => NotificationDto)
  data: NotificationDto[];

  @Expose()
  @IsArray()
  @Type(() => NotificationDto)
  messages: NotificationDto[];

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
