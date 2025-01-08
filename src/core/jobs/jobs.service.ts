import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';

import { Job } from './entities/job.entity';
import { CreateOrUpdateJobDto } from './dtos/create-update-job.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { SkillsService } from './../skills/skills.service';
import { SkillType } from '../skills/skills.constants';
import { ResourceTypes } from '../../common/constants/index.constants';
import { ReactionsService } from '../reactions/reactions.service';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CreateReactionDto } from '../reactions/dtos/create-reaction.dto';
import { User } from '../users/entities/user.entity';
import { Reaction } from '../reactions/entities/reaction.entity';
import { JobStatus } from './jobs.constants';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    // @InjectRepository(Profile)
    // private readonly profilesRepository: Repository<Profile>,
    private readonly skillsService: SkillsService,
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
  ) {}

  async getJobs(
    profile: Profile,
    page: number = 1,
    limit: number = 10,
    contentType: 'following' | 'all' | 'user' = 'following',
    skills?: string[],
    location?: string,
    status?: JobStatus,
    keyword?: string,
    orderBy?: 'ASC' | 'DESC',
    sortBy?: string,
  ) {
    const followingUuids =
      profile.following?.map((follow) => follow.user.uuid) || [];

    const queryBuilder = this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.owner', 'owner')
      .leftJoinAndSelect('job.comments', 'comments')
      .leftJoinAndSelect('job.reactions', 'reactions')
      .leftJoinAndSelect('job.skills', 'skills');

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

    if (skills && skills.length > 0) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('skillJob.job_id')
          .from('jobs_skills', 'skillJob')
          .innerJoin('skills', 's', 'skillJob.skill_id = s.id')
          .where('s.title IN (:...skills)', {
            skills: skills.map((s) => s.toLowerCase()),
          })
          .groupBy('skillJob.job_id')
          .having('COUNT(skillJob.skill_id) >= :skillCount', {
            skillCount: skills.length,
          })
          .getQuery();
        return `job.id IN (${subQuery})`;
      });
    }

    if (location) {
      queryBuilder.andWhere('job.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('job.status = :status', { status });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('job.title ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('job.description ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    queryBuilder.orderBy(`job.${sortBy || 'created_at'}`, orderBy || 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCurrentUserJob(id: string, profileId: string) {
    const job = await this.jobsRepository.findOne({
      where: { uuid: id, owner: { uuid: profileId } },
      relations: ['owner', 'comments', 'reactions', 'skills'],
    });

    if (!job) throw new NotFoundException('Job not found');

    return job;
  }

  async getOneJob(currentUserProfileId: string, jobId: string) {
    const job = await this.jobsRepository.findOne({
      where: { uuid: jobId },
      relations: ['owner', 'comments', 'reactions', 'skills'],
    });

    if (!job) throw new NotFoundException('Job not found');

    job.owner?.uuid !== currentUserProfileId && this.updateJobViews(jobId);

    return job;
  }

  async updateJobViews(jobId: string) {
    const job = await this.jobsRepository.findOne({
      where: { uuid: jobId },
    });

    if (!job) throw new NotFoundException('Job does not exist');
    Object.assign(job, { ...job, views: ++job.views });

    return await this.jobsRepository.save(job);
  }

  async createJob(jobDto: CreateOrUpdateJobDto, profile: Profile) {
    const job = await this.findOrCreateJob({ jobDto, profile });

    return job;
  }

  async udpateJob(
    jobId: string,
    jobDto: CreateOrUpdateJobDto,
    profile: Profile,
  ) {
    const job = await this.findOrCreateJob({
      jobDto,
      profile,
      jobId,
    });

    return job;
  }

  async findOrCreateJob({
    jobId,
    profile,
    jobDto,
  }: {
    jobDto: CreateOrUpdateJobDto;
    profile: Profile;
    jobId?: string;
  }) {
    let job;

    if (jobId) {
      job = await this.jobsRepository.findOne({
        where: { uuid: jobId, owner: { uuid: profile.uuid } },
        relations: ['owner'],
      });

      if (!job) throw new BadRequestException('Job posting not found');
      if (job.owner.uuid !== profile.uuid)
        throw new ForbiddenException('You are not allowed to update this job');
    }

    if (!job) {
      job = this.jobsRepository.create({
        title: jobDto.title,
        description: jobDto.description,
        website: jobDto.website,
        owner: profile,
        application_url: jobDto.application_url,
        deadline: jobDto.deadline,
        status: jobDto.status,
        location: jobDto.location,
        views: 0,
      });

      if (jobDto.skills?.length) {
        job.skills = [];

        for await (const requirement of jobDto.skills) {
          if (requirement.title) {
            const savedSkill = await this.skillsService.findOrCreateSkill(
              requirement,
              profile,
              SkillType.JOB,
            );

            job.skills.push(savedSkill);
          }
        }
      }

      job = await this.jobsRepository.save(job);
    } else {
      Object.assign(job, { ...jobDto, owner: profile });

      if (jobDto.skills?.length) {
        job.skills = [];
        for await (const requirement of jobDto.skills) {
          if (requirement.title) {
            const savedSkill = await this.skillsService.findOrCreateSkill(
              requirement,
              profile,
              SkillType.JOB,
            );

            job.skills.push(savedSkill);
          }
        }
      }

      await this.jobsRepository.save(job);
    }

    return job;
  }

  async deleteJob(jobId: string, profileId: string) {
    const job = await this.jobsRepository.findOne({
      where: { uuid: jobId },
      relations: ['owner'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.owner.uuid !== profileId) {
      throw new ForbiddenException('You are not allowed to delete this job');
    }

    return await this.jobsRepository.remove(job);
  }

  async addComment(
    user: User,
    jobId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const job = await this.jobsRepository.findOne({
      where: { uuid: jobId },
      relations: ['owner'],
    });

    if (!job) throw new NotFoundException('Job does not exist');

    const comment = await this.commentsService.createComment(
      user,
      job,
      ResourceTypes.JOB,
      createCommentDto,
    );

    // const activityData = { type: ActivityTypes.COMMENT };
    // this.activitiesService.createActivity(
    //   user.profile,
    //   job,
    //   ResourceTypes.JOB,
    //   activityData,
    // );

    return comment;
  }

  async deleteComment(commentId: string, profileId: string) {
    return await this.commentsService.deleteComment(commentId, profileId);
  }

  async addOrRemoveReaction(
    user: User,
    jobId: string,
    createReactionDto: CreateReactionDto,
  ) {
    const job = await this.jobsRepository.findOne({
      where: { uuid: jobId },
      relations: ['owner'],
    });

    if (!job) throw new NotFoundException('Job does not exist');

    const result = await this.reactionsService.handleReaction(
      user,
      job,
      ResourceTypes.JOB,
      createReactionDto,
    );

    // if (result.status) {
    //   const activityData = { type: ActivityTypes.LIKE };
    //   this.activitiesService.createActivity(
    //     user.profile,
    //     job,
    //     ResourceTypes.JOB,
    //     activityData,
    //   );
    // }

    return result.data as Reaction;
  }
}
