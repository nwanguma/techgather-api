import { IsEmail, IsString } from 'class-validator';

export class InitiateResetPasswordDto {
  @IsString()
  @IsEmail()
  email: string;
}
