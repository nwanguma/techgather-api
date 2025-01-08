import { Expose, Transform, Type } from 'class-transformer';

import { LimitedProfileDto } from '../../profiles/dtos/profile.dto';

export class ReactionDto {
  @Expose()
  @Transform(({ obj }) => obj?.uuid)
  id: string;

  @Expose()
  created_at: string;

  @Expose()
  @Type(() => LimitedProfileDto)
  owner: LimitedProfileDto;
}

export class LimitedReactionDto {
  @Expose()
  @Transform(({ obj }) => obj?.uuid)
  id: string;
}
