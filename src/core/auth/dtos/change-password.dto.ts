import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  new_password: string;

  @IsString()
  old_password: string;
}
