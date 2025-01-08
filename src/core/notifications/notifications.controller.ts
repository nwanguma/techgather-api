import {
  Controller,
  Query,
  Post,
  Param,
  Get,
  Put,
  UseGuards,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';

import { NotificationsService } from './notifications.service';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { PaginatedNotificationDto } from './dtos/notification.dto';
import { CacheService } from '../../utilities/caching/cache.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
  }

  //Todo: optimize this
  @Get('long-poll')
  @UseGuards(JwtAuthGuard)
  async longPolling(
    @GetCurrentUser('uuid') userId: string,
    @Res() res: Response,
  ) {
    const timeout = 25000;
    const pollingInterval = 5000;

    let hasNewNotifications = false;
    let hasNewMessages = false;

    const latestSentNotificationsTimestampCacheKey = `user_${userId}_latest_notification_time`;
    const latestSentNotificationsTimestampCacheData =
      await this.cacheService.get(latestSentNotificationsTimestampCacheKey);

    const latestSentMessagesTimestampCacheKey = `user_${userId}_latest_message_time`;
    const latestSentMessagesTimestampCacheData = await this.cacheService.get(
      latestSentMessagesTimestampCacheKey,
    );

    let pollingTimeoutId: NodeJS.Timeout;

    const checkForNewNotifications = async () => {
      try {
        const notificationsData =
          await this.notificationsService.getUserNotificationsLongPoll(userId);

        let checkHasNewNotifications = false;
        let checkHasNewMessages = false;

        if (notificationsData.data.length > 0) {
          const latestNotificationTimeStamp = new Date(
            notificationsData.data[0].created_at,
          ).getTime();

          checkHasNewNotifications =
            !latestSentNotificationsTimestampCacheData ||
            latestNotificationTimeStamp !==
              latestSentNotificationsTimestampCacheData;
        }

        if (notificationsData.messages.length > 0) {
          const latestMessageTimeStamp = new Date(
            notificationsData.messages[0].created_at,
          ).getTime();

          checkHasNewMessages =
            !latestSentMessagesTimestampCacheData ||
            latestMessageTimeStamp !== latestSentMessagesTimestampCacheData;
        }

        if (checkHasNewNotifications && checkHasNewMessages) {
          const latestNotificationTimeStamp = new Date(
            notificationsData.data[0].created_at,
          ).getTime();

          const latestMessageTimeStamp = new Date(
            notificationsData.messages[0].created_at,
          ).getTime();

          hasNewNotifications = true;
          hasNewMessages = true;

          await this.cacheService.set(
            latestSentNotificationsTimestampCacheKey,
            latestNotificationTimeStamp,
          );

          await this.cacheService.set(
            latestSentMessagesTimestampCacheKey,
            latestMessageTimeStamp,
          );

          if (pollingTimeoutId) clearTimeout(pollingTimeoutId);

          return res.json({
            ...notificationsData,
            data: notificationsData?.data
              ?.filter((notification) => {
                return (
                  new Date(notification.created_at).getTime() >=
                  latestNotificationTimeStamp
                );
              })
              .map((notification) => notification.uuid),
            messages: notificationsData?.messages
              ?.filter((message) => {
                return (
                  new Date(message.created_at).getTime() >=
                  latestMessageTimeStamp
                );
              })
              .map((message) => message.uuid),
          });
        }

        if (checkHasNewNotifications) {
          const latestNotificationTimeStamp = new Date(
            notificationsData.data[0].created_at,
          ).getTime();

          hasNewNotifications = true;

          await this.cacheService.set(
            latestSentNotificationsTimestampCacheKey,
            latestNotificationTimeStamp,
          );

          if (pollingTimeoutId) clearTimeout(pollingTimeoutId);

          return res.json({
            ...notificationsData,
            data: notificationsData?.data
              ?.filter((notification) => {
                return (
                  new Date(notification.created_at).getTime() >=
                  latestNotificationTimeStamp
                );
              })
              .map((notification) => notification.uuid),
            messages: [],
          });
        }

        if (checkHasNewMessages) {
          const latestMessageTimeStamp = new Date(
            notificationsData.messages[0].created_at,
          ).getTime();

          hasNewMessages = true;

          await this.cacheService.set(
            latestSentMessagesTimestampCacheKey,
            latestMessageTimeStamp,
          );

          if (pollingTimeoutId) clearTimeout(pollingTimeoutId);

          return res.json({
            ...notificationsData,
            data: [],
            messages: notificationsData?.messages
              ?.filter((message) => {
                return (
                  new Date(message.created_at).getTime() >=
                  latestMessageTimeStamp
                );
              })
              .map((message) => message.uuid),
          });
        }

        pollingTimeoutId = setTimeout(
          checkForNewNotifications,
          pollingInterval,
        );
      } catch (error) {
        console.error('Error checking notifications:', error);
        return res
          .status(500)
          .json({ message: 'An error occurred during polling.' });
      }
    };

    checkForNewNotifications();

    const endTimeoutId = setTimeout(() => {
      if (!hasNewNotifications && !hasNewMessages) {
        if (pollingTimeoutId) clearTimeout(pollingTimeoutId);

        res.json({ data: [], messages: [], total: 0 });
      }

      clearTimeout(endTimeoutId);
    }, timeout);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(PaginatedNotificationDto))
  async getUserNotifications(
    @GetCurrentUser('uuid') userId: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return this.notificationsService.getUserNotifications(userId, page, limit);
  }
}
