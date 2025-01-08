import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Put,
  Patch,
  UseGuards,
  UseInterceptors,
  Delete,
  Query,
} from '@nestjs/common';

import { CreateOrUpdateEventDto } from './dtos/create-update-event.dto';
import { EventsService } from './events.service';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { EventDto, PaginatedLimitedEventDto } from './dtos/event.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CreateReactionDto } from './../reactions/dtos/create-reaction.dto';
import { EventTypes } from './events.constants';
import { CreateOrUpdateFeedbackDto } from '../feedback/dtos/create-update-feedback.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(PaginatedLimitedEventDto))
  async getEvents(
    @GetCurrentUser('profile') profile: Profile,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('contentType') contentType: 'all' | 'following',
    @Query('skills') skills: string[],
    @Query('eventType') eventType: EventTypes,
    @Query('location') location: string,
    @Query('keyword') keyword: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('sortBy') sortBy: string,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
  ) {
    return await this.eventsService.getEvents(
      page,
      limit,
      contentType,
      profile,
      skills,
      eventType,
      location,
      keyword,
      startDate,
      endDate,
      orderBy,
      sortBy,
    );
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(EventDto))
  async getCurrentUserEvent(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.eventsService.getCurrentUserEvent(id, profile.uuid);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(EventDto))
  async getOneEvent(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.eventsService.getOneEvent(profile.uuid, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(EventDto))
  async createEvent(
    @GetCurrentUser('profile') profile: Profile,
    @Body() body: CreateOrUpdateEventDto,
  ) {
    return await this.eventsService.createEvent(body, profile);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(EventDto))
  async updateEvent(
    @GetCurrentUser() { profile }: User,
    @Param('id') eventId: string,
    @Body() createOrUpdateProfileDto: CreateOrUpdateEventDto,
  ) {
    return await this.eventsService.udpateEvent(
      eventId,
      createOrUpdateProfileDto,
      profile,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteEvent(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') eventId: string,
  ) {
    return await this.eventsService.deleteEvent(eventId, profile.uuid);
  }

  @Patch(':id/views')
  @UseGuards(JwtAuthGuard)
  async updateEventViews(@Param('id') eventId: string) {
    return await this.eventsService.updateEventViews(eventId);
  }

  @Post(':eventId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @GetCurrentUser() user: User,
    @Param('eventId')
    eventId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.eventsService.addComment(user, eventId, createCommentDto);
  }

  @Delete(':eventId/:commentId/comments')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @GetCurrentUser('profile') profile: Profile,
    @Param('commentId') commentId: string,
  ) {
    return await this.eventsService.deleteComment(commentId, profile.uuid);
  }

  @Post(':eventId/reactions')
  @UseGuards(JwtAuthGuard)
  async addOrRemoveReaction(
    @GetCurrentUser() user: User,
    @Param('eventId')
    eventId: string,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return await this.eventsService.addOrRemoveReaction(
      user,
      eventId,
      user.profile.uuid,
      createReactionDto,
    );
  }

  @Post(':eventId/feedbacks')
  @UseGuards(JwtAuthGuard)
  async addFeedback(
    @GetCurrentUser() user: User,
    @Param('eventId')
    eventId: string,
    @Body() createFeedbackDto: CreateOrUpdateFeedbackDto,
  ) {
    return await this.eventsService.addFeedback(
      user,
      eventId,
      user.profile.uuid,
      createFeedbackDto,
    );
  }

  @Delete(':eventId/:feedbackId/feedbacks')
  @UseGuards(JwtAuthGuard)
  async deleteFeedback(
    @GetCurrentUser('profile') profile: Profile,
    @Param('feedbackId') feedbackId: string,
  ) {
    return await this.eventsService.deleteFeedback(feedbackId, profile.uuid);
  }
}
