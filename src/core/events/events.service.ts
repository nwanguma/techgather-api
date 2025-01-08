import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';

import { Event } from './entities/event.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { CreateOrUpdateEventDto } from './dtos/create-update-event.dto';
import { ResourceTypes } from './../../common/constants/index.constants';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { ReactionsService } from '../reactions/reactions.service';
import { CreateReactionDto } from '../reactions/dtos/create-reaction.dto';
import { FeedbacksService } from '../feedback/feedbacks.service';
import { User } from '../users/entities/user.entity';
import { Reaction } from '../reactions/entities/reaction.entity';
import { EventTypes } from './events.constants';
import { CreateOrUpdateFeedbackDto } from '../feedback/dtos/create-update-feedback.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
    private readonly feedbacksService: FeedbacksService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getEvents(
    page: number = 1,
    limit: number = 10,
    contentType: 'following' | 'all' | 'user',
    profile: Profile,
    skills: string[] = [],
    eventType?: EventTypes,
    location?: string,
    keyword?: string,
    startDate?: string,
    endDate?: string,
    orderBy: 'ASC' | 'DESC' = 'DESC',
    sortBy: string = 'event_start_date',
  ) {
    const followingUuids =
      profile.following?.map((follow) => follow.user.uuid) || [];

    const queryBuilder = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.owner', 'owner')
      .leftJoinAndSelect('event.comments', 'comments')
      .leftJoinAndSelect('event.feedbacks', 'feedbacks')
      .leftJoinAndSelect('event.reactions', 'reactions');

    if (contentType === 'following' && followingUuids.length > 0) {
      queryBuilder.andWhere('owner.uuid IN (:...followingUuids)', {
        followingUuids,
      });
    } else if (contentType === 'following' && followingUuids.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        totalPages: 0,
        perPage: limit,
      };
    } else if (contentType === 'user') {
      queryBuilder.andWhere('owner.uuid = :uuid', { uuid: profile.uuid });
    }

    if (skills.length > 0) {
      queryBuilder.andWhere('event.skills && ARRAY[:...skills]', { skills });
    }

    if (eventType) {
      queryBuilder.andWhere('event.type = :eventType', { eventType });
    }

    if (location) {
      queryBuilder.andWhere('event.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('event.title ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('event.description ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'event.event_start_date BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('event.event_start_date >= :startDate', {
        startDate,
      });
    } else if (endDate) {
      queryBuilder.andWhere('event.event_start_date <= :endDate', { endDate });
    }

    queryBuilder.orderBy(
      `event.${sortBy || 'event_start_date'}`,
      orderBy || 'DESC',
    );
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      perPage: limit,
    };
  }

  async getOneEvent(profileId: string, eventId: string) {
    const event = await this.eventsRepository.findOne({
      where: { uuid: eventId },
      relations: ['owner', 'comments', 'feedbacks', 'reactions'],
    });

    if (!event) throw new NotFoundException('Event does not exist');

    event.owner?.uuid !== profileId && this.updateEventViews(event.uuid);

    return event;
  }

  async getCurrentUserEvent(id: string, profileId: string) {
    const event = await this.eventsRepository.findOne({
      where: { uuid: id, owner: { uuid: profileId } },
      relations: ['owner', 'comments', 'feedbacks', 'reactions'],
    });

    if (!event) throw new NotFoundException('Event does not exist');

    this.updateEventViews(event.uuid);

    return event;
  }

  async createEvent(eventDto: CreateOrUpdateEventDto, profile: Profile) {
    const event = await this.findOrCreateEvent({ eventDto, profile });

    return event;
  }

  async udpateEvent(
    eventId: string,
    eventDto: CreateOrUpdateEventDto,
    profile: Profile,
  ) {
    const event = await this.findOrCreateEvent({
      eventDto,
      profile,
      eventId,
    });

    return event;
  }

  async findOrCreateEvent({
    eventId,
    profile,
    eventDto,
  }: {
    eventDto: CreateOrUpdateEventDto;
    profile: Profile;
    eventId?: string;
  }) {
    let event;

    if (eventId) {
      event = await this.eventsRepository.findOne({
        where: { uuid: eventId, owner: { uuid: profile.uuid } },
        relations: ['owner'],
      });

      if (!event) throw new NotFoundException('Event does not exist');
      if (event.owner.uuid !== profile.uuid)
        throw new ForbiddenException(
          'You are not allowed to update this event',
        );
    }

    if (!event) {
      event = this.eventsRepository.create({
        ...eventDto,
        views: 0,
        owner: profile,
      });

      event = await this.eventsRepository.save(event);
    } else {
      Object.assign(event, {
        ...eventDto,
        owner: event.owner,
        views: event.views,
      });

      event = await this.eventsRepository.save(event);
    }

    return event;
  }

  async deleteEvent(eventId: string, profileId: string) {
    const event = await this.eventsRepository.findOne({
      where: { uuid: eventId },
      relations: ['owner'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.owner.uuid !== profileId) {
      throw new ForbiddenException('You are not allowed to delete this event');
    }

    return await this.eventsRepository.remove(event);
  }

  async updateEventViews(eventId: string) {
    const event = await this.eventsRepository.findOne({
      where: { uuid: eventId },
    });

    if (!event) throw new NotFoundException('Event does not exist');
    Object.assign(event, { ...event, views: ++event.views });

    return await this.eventsRepository.save(event);
  }

  async addComment(
    user: User,
    eventId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const event = await this.eventsRepository.findOne({
      where: { uuid: eventId },
      relations: ['owner'],
    });

    if (!event) throw new NotFoundException('Event does not exist');

    const comment = await this.commentsService.createComment(
      user,
      event,
      ResourceTypes.EVENT,
      createCommentDto,
    );

    // const activityData = { type: ActivityTypes.COMMENT };
    // this.activitiesService.createActivity(
    //   user.profile,
    //   event,
    //   ResourceTypes.EVENT,
    //   activityData,
    // );

    return comment;
  }

  async deleteComment(commentId: string, profileId: string) {
    return await this.commentsService.deleteComment(commentId, profileId);
  }

  async addOrRemoveReaction(
    user: User,
    eventId: string,
    reactingProfileId: string,
    createReactionDto: CreateReactionDto,
  ) {
    const event = await this.eventsRepository.findOne({
      where: { uuid: eventId },
      relations: ['owner'],
    });

    if (!event) throw new NotFoundException('Event does not exist');

    const result = await this.reactionsService.handleReaction(
      user,
      event,
      ResourceTypes.EVENT,
      createReactionDto,
    );

    // if (result.status) {
    //   const activityData = { type: ActivityTypes.LIKE };
    //   this.activitiesService.createActivity(
    //     user.profile,
    //     event,
    //     ResourceTypes.EVENT,
    //     activityData,
    //   );
    // }

    return result.data as Reaction;
  }

  async addFeedback(
    user: User,
    eventId: string,
    feedbackOwnerProfileId: string,
    createFeedbackDto: CreateOrUpdateFeedbackDto,
  ) {
    const event = await this.eventsRepository.findOne({
      where: { uuid: eventId },
    });

    if (!event) throw new NotFoundException('Event does not exist');

    const feedback = await this.feedbacksService.createFeedback(
      user,
      event,
      ResourceTypes.EVENT,
      feedbackOwnerProfileId,
      event.feedback_guide,
      createFeedbackDto,
    );

    return feedback;
  }

  async deleteFeedback(feedbackId: string, profileId: string) {
    return await this.feedbacksService.deleteFeedback(
      feedbackId,
      'event',
      profileId,
    );
  }
}
