import { Expose, Type } from 'class-transformer';
import { IsArray } from 'class-validator';

import { LimitedArticleDto } from '../../articles/dtos/article.dto';
import { LimitedEventDto } from '../../events/dtos/event.dto';
import { LimitedJobDto } from '../../jobs/dtos/job.dto';

export class RecommendationDto {
  @Expose()
  @Type(() => LimitedEventDto)
  @IsArray()
  events: LimitedEventDto;

  @Expose()
  @Type(() => LimitedEventDto)
  @IsArray()
  upcomingEvents: LimitedEventDto;

  @Expose()
  @Type(() => LimitedEventDto)
  @IsArray()
  liveEvents: LimitedEventDto;

  @Expose()
  @Type(() => LimitedArticleDto)
  @IsArray()
  articles: LimitedArticleDto;

  @Expose()
  @Type(() => LimitedJobDto)
  @IsArray()
  jobs: LimitedJobDto;
}
