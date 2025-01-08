import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  guide: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}
