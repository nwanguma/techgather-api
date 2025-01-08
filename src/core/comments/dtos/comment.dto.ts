import { Expose, Transform, Type } from 'class-transformer';

import { LimitedProfileDto } from '../../profiles/dtos/profile.dto';

export class CommentDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  text: string;

  @Expose()
  created_at: string;

  @Expose()
  @Type(() => LimitedProfileDto)
  owner: LimitedProfileDto;
}

export class LimitedCommentDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;
}
