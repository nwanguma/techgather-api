import {
  NotFoundException,
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOrUpdateFeedbackDto } from './dtos/create-update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Event } from '../events/entities/event.entity';
import {
  NotificationCategories,
  NotificationTypes,
} from '../notifications/notifications.constant';
import { NotificationsService } from '../notifications/notifications.service';
import { ResourceTypes } from '../../common/constants/index.constants';

@Injectable()
export class FeedbacksService {
  private readonly logger = new Logger(FeedbacksService.name);

  constructor(
    @InjectRepository(Feedback)
    private readonly feedbacksRepository: Repository<Feedback>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createFeedback(
    user,
    resource: Event,
    resourceType: ResourceTypes,
    feedbackOwnerProfileId: string,
    guide: string,
    createFeedbackDto: CreateOrUpdateFeedbackDto,
  ) {
    if (!resource) throw new BadRequestException('Event must be provided');

    const feedbackOwnerProfile = await this.profilesRepository.findOne({
      where: {
        uuid: feedbackOwnerProfileId,
      },
    });

    if (!feedbackOwnerProfile)
      throw new NotFoundException('Profile does not exist');

    const feedback = this.feedbacksRepository.create(createFeedbackDto);
    feedback.guide = guide;
    feedback[resourceType] = resource;
    feedback.owner = feedbackOwnerProfile;

    const savedFeedback = await this.feedbacksRepository.save(feedback);

    try {
      this.notificationsService.createNotification(
        user,
        {
          resource_type: resourceType,
          category: NotificationCategories.FEEDBACK,
          type: [NotificationTypes.PUSH],
          content: savedFeedback.text,
        },
        resource,
      );
    } catch (e) {
      this.logger.error('An error occurred creating notification');
    }

    return savedFeedback;
  }

  async updateFeedback(
    feedbackOwnerProfileId: string,
    feedbackId: string,
    updateFeedbackDto: CreateOrUpdateFeedbackDto,
  ) {
    const feedbackOwnerProfile = await this.profilesRepository.findOne({
      where: {
        uuid: feedbackOwnerProfileId,
      },
    });

    if (!feedbackOwnerProfile)
      throw new NotFoundException('Profile does not exist');

    const feedback = await this.feedbacksRepository.findOne({
      where: {
        uuid: feedbackId,
      },
    });

    if (!feedback) throw new BadRequestException('Feedback not found');

    if (feedbackOwnerProfileId !== feedback.owner.uuid)
      throw new UnprocessableEntityException(
        'You are not allowed to edit this feedback',
      );

    Object.assign(feedback, { ...updateFeedbackDto });

    return await this.feedbacksRepository.save(feedback);
  }

  async deleteFeedback(
    feedbackId: string,
    resourceType: 'event',
    profileId: string,
  ) {
    const feedback = await this.feedbacksRepository.findOne({
      where: {
        uuid: feedbackId,
      },
      relations: ['owner', resourceType, `${resourceType}.owner`],
    });

    if (!feedback) throw new NotFoundException('Feedback not found');

    if (
      profileId !== feedback.owner.uuid &&
      profileId !== feedback[resourceType].owner?.uuid
    )
      throw new UnprocessableEntityException(
        'You are not allowed to delete this feedback',
      );

    return await this.feedbacksRepository.remove(feedback);
  }
}
