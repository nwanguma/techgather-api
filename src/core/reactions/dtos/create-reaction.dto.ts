import { IsEnum } from 'class-validator';
import { ReactionType } from '../reaction.constants';

export class CreateReactionDto {
  @IsEnum(ReactionType)
  type: ReactionType;
}
