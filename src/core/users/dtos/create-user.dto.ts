import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  ValidateIf,
  Matches,
} from 'class-validator';
import { OAuthProvider } from '../users.constants';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @ValidateIf((o) => !o.provider && !o.providerId)
  @IsString()
  first_name?: string;

  @ValidateIf((o) => !o.provider && !o.providerId)
  @IsString()
  last_name?: string;

  @ValidateIf((o) => !o.provider && !o.providerId)
  @IsString()
  @MinLength(8)
  @Matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/,
    {
      message:
        'Password too weak. It must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password?: string;

  @ValidateIf((o) => !o.password)
  @IsEnum(OAuthProvider)
  provider?: OAuthProvider;

  @ValidateIf((o) => !o.password)
  @IsString()
  provider_id?: string;

  @ValidateIf((o) => !o.password)
  @IsString()
  access_token?: string;
}
