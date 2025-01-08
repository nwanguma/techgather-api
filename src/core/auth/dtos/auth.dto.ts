import { Type, Expose } from 'class-transformer';

import { IsString } from 'class-validator';
import { UserDto } from '../../users/dtos/user.dto';

export class AuthDto {
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @IsString()
  @Expose()
  refresh_token: string;

  @IsString()
  @Expose()
  access_token: string;

  @IsString()
  @Expose()
  expires_in: number;
}
