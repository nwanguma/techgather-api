import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
  Delete,
  Query,
} from '@nestjs/common';

import { CreateOrUpdateJobDto } from './dtos/create-update-job.dto';
import { JobsService } from './jobs.service';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { JobDto, PaginatedLimitedJobDto } from './dtos/job.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CreateReactionDto } from '../reactions/dtos/create-reaction.dto';
import { JobStatus } from './jobs.constants';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(PaginatedLimitedJobDto))
  async getJobs(
    @GetCurrentUser('profile') profile: Profile,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('contentType') contentType: 'all' | 'following',
    @Query('skills') skills?: string[],
    @Query('location') location?: string,
    @Query('status') status?: JobStatus,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('orderBy') orderBy?: 'ASC' | 'DESC',
  ) {
    return await this.jobsService.getJobs(
      profile,
      page,
      limit,
      contentType,
      skills,
      location,
      status,
      keyword,
      orderBy,
      sortBy,
    );
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(JobDto))
  async getCurrentUserJob(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.jobsService.getCurrentUserJob(id, profile.uuid);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(JobDto))
  async getOneJob(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.jobsService.getOneJob(profile.uuid, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(JobDto))
  async createJob(
    @GetCurrentUser('profile') profile: Profile,
    @Body() body: CreateOrUpdateJobDto,
  ) {
    return await this.jobsService.createJob(body, profile);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(JobDto))
  async updateJob(
    @GetCurrentUser() { profile }: User,
    @Param('id') id: string,
    @Body() body: CreateOrUpdateJobDto,
  ) {
    return await this.jobsService.udpateJob(id, body, profile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteJob(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') jobId: string,
  ) {
    return await this.jobsService.deleteJob(jobId, profile.uuid);
  }

  @Post(':jobId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @GetCurrentUser() user: User,
    @Param('jobId')
    jobId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.jobsService.addComment(user, jobId, createCommentDto);
  }

  @Delete(':jobId/:commentId/comments')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @GetCurrentUser('profile') profile: Profile,
    @Param('commentId') commentId: string,
  ) {
    return await this.jobsService.deleteComment(commentId, profile.uuid);
  }

  @Post(':jobId/reactions')
  @UseGuards(JwtAuthGuard)
  async addOrRemoveReaction(
    @GetCurrentUser() user: User,
    @Param('jobId')
    jobId: string,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return await this.jobsService.addOrRemoveReaction(
      user,
      jobId,
      createReactionDto,
    );
  }
}
