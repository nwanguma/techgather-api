import { IsString } from 'class-validator';

export class CreateTokensDto {
  @IsString()
  refresh_token: string;
}
