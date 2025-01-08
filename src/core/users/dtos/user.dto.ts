import { Expose, Transform, Type } from 'class-transformer';

import { UserStatus } from '../users.constants';
import { ProfileDto } from '../../../core/profiles/dtos/profile.dto';
import { LimitedProfileDto } from '../../../core/profiles/dtos/profile.dto';

export class UserDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  email: string;

  @Expose()
  created_at: Date;

  @Expose()
  status: UserStatus;

  @Expose()
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @Expose()
  last_seen: Date;
}

export class LimitedUserWithProfileDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  @Type(() => LimitedProfileDto)
  profile: LimitedProfileDto;
}
