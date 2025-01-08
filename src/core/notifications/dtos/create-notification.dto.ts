import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import {
  NotificationCategories,
  NotificationTypes,
} from '../notifications.constant';
import { ResourceTypes } from '../../../common/constants/index.constants';

export class CreateNotificationDto {
  @IsArray()
  @IsEnum(NotificationTypes, { each: true })
  type: NotificationTypes[];

  @IsEnum(NotificationCategories)
  category: NotificationCategories;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  recipient_id?: string;

  @IsEnum(ResourceTypes)
  resource_type?: ResourceTypes;
}
