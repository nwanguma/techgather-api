import { ResourceTypes } from './../../common/constants/index.constants';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import * as Sentry from '@sentry/node';

import { Notification } from './notifications.entity';
import { MailjetService } from '../../integrations/mailjet/mailjet.service';
import {
  NotificationCategories,
  NotificationTypes,
} from './notifications.constant';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { Article } from '../articles/entities/article.entity';
import { Event } from '../events/entities/event.entity';
import { Job } from '../jobs/entities/job.entity';
import { User } from '../users/entities/user.entity';
import { Feedback } from '../feedback/entities/feedback.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailjetService: MailjetService,
  ) {}

  async createNotification(
    user: User,
    {
      resource_type,
      category,
      type,
      content,
      recipient_id,
    }: CreateNotificationDto,
    resource?: Event | Job | Profile | Article | Feedback,
  ) {
    if (!resource)
      throw new BadRequestException(
        'Resource must be one of event, article or job',
      );

    const recipient = await this.usersRepository.findOne({
      where: {
        uuid:
          resource_type === ResourceTypes.PROFILE
            ? (resource as Profile).user_uuid
            : resource_type === ResourceTypes.MESSAGE
              ? recipient_id
              : (resource as Event | Job | Article | Feedback).owner.user_uuid,
      },
    });

    if (!recipient) throw new BadRequestException('Recipient does not exist');

    const subject = 'Test subject';
    const htmlContent = 'Test content';

    const notification = this.notificationsRepository.create({
      resource_type,
      category,
      content,
    });

    notification.type = type;
    notification.initiator = user;
    notification.recipient = recipient ?? user;

    if (resource_type) {
      notification[resource_type] = resource;
    }

    const savedNotification =
      await this.notificationsRepository.save(notification);

    await this.notificationsRepository.manager.connection.queryResultCache.remove(
      [`user_notifications_${user.uuid}`],
    );

    if (type.includes[NotificationTypes.SMS]) {
      // Send SMS
    }

    if (type.includes[NotificationTypes.EMAIL]) {
      try {
        await this.mailjetService.sendEmail(
          user.email,
          subject,
          content,
          htmlContent,
        );
      } catch (e) {
        // Sentry.captureException(e);

        this.logger.error(
          `Failed to send ${category} email to ${user.email}: ${user.uuid}`,
        );
      }
    }

    return savedNotification;
  }

  async markAsRead(notificationId: string) {
    const notification = await this.notificationsRepository.findOneBy({
      id: notificationId,
    });
    if (notification) {
      notification.is_read = true;
      await this.notificationsRepository.save(notification);
    }
  }

  async getUserNotifications(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<any> {
    const queryBuilder = this.notificationsRepository
      .createQueryBuilder('notification')
      .innerJoinAndSelect('notification.initiator', 'initiator')
      .innerJoinAndSelect('initiator.profile', 'initiatorProfile')
      .innerJoinAndSelect('notification.recipient', 'recipient')
      .innerJoinAndSelect('recipient.profile', 'recipientProfile')
      .leftJoinAndSelect('notification.profile', 'profile')
      .leftJoinAndSelect('notification.job', 'job')
      .leftJoinAndSelect('notification.event', 'event')
      .leftJoinAndSelect('notification.article', 'article')
      .leftJoinAndSelect('notification.message', 'message')
      .where('recipient.uuid = :userId', { userId })
      .andWhere(
        'notification.type && ARRAY[:...notificationTypes]::notifications_type_enum[]',
        {
          notificationTypes: [
            // NotificationTypes.MESSAGE,
            NotificationTypes.PUSH,
          ],
        },
      )
      .andWhere('notification.category NOT IN (:...excludedCategories)', {
        excludedCategories: [
          NotificationCategories.EMAIL_VERIFICATION,
          NotificationCategories.PASSWORD_CHANGE,
          NotificationCategories.PASSWORD_RESET,
        ],
      });

    if (page && limit) {
      const offset = (page - 1) * limit;
      queryBuilder
        .orderBy('notification.created_at', 'DESC')
        .cache(`user_notifications_${userId}`, 60000)
        .skip(offset)
        .take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        page: total ? page : 0,
        totalPages: Math.ceil(total / limit),
      };
    }

    const data = await queryBuilder
      .orderBy('notification.created_at', 'DESC')
      .getMany();

    return {
      data,
    };
  }

  async getUserNotificationsLongPoll(userId: string): Promise<any> {
    const queryBuilder = this.notificationsRepository
      .createQueryBuilder('notification')
      .innerJoinAndSelect('notification.initiator', 'initiator')
      .innerJoinAndSelect('initiator.profile', 'initiatorProfile')
      .innerJoinAndSelect('notification.recipient', 'recipient')
      .innerJoinAndSelect('recipient.profile', 'recipientProfile')
      .leftJoinAndSelect('notification.profile', 'profile')
      .leftJoinAndSelect('notification.job', 'job')
      .leftJoinAndSelect('notification.event', 'event')
      .leftJoinAndSelect('notification.article', 'article')
      .where('recipient.uuid = :userId', { userId })
      .andWhere(
        'notification.type && ARRAY[:...notificationTypes]::notifications_type_enum[]',
        {
          notificationTypes: [
            NotificationTypes.MESSAGE,
            NotificationTypes.PUSH,
          ],
        },
      )
      .andWhere('notification.category NOT IN (:...excludedCategories)', {
        excludedCategories: [
          NotificationCategories.EMAIL_VERIFICATION,
          NotificationCategories.PASSWORD_CHANGE,
          NotificationCategories.PASSWORD_RESET,
        ],
      });

    const data = await queryBuilder
      .orderBy('notification.created_at', 'DESC')
      .getMany();

    return {
      data: data.filter((data) => data.type.includes(NotificationTypes.PUSH)),
      messages: data.filter((data) =>
        data.type.includes(NotificationTypes.MESSAGE),
      ),
    };
  }
}
