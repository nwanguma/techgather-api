import { Expose, Transform, Type } from 'class-transformer';

import { LimitedProfileDto } from '../../profiles/dtos/profile.dto';

export class FeedbackDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  guide: string;

  @Expose()
  text: string;

  @Expose()
  created_at: string;

  @Expose()
  @Type(() => LimitedProfileDto)
  owner: LimitedProfileDto;
}
