import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Repository, In, Brackets } from 'typeorm';

import { CreateOrUpdateProfileDto } from './dtos/create-update-profile.dto';
import { Profile } from './entities/profile.entity';
import { ReactionsService } from './../reactions/reactions.service';
import { SkillsService } from '../skills/skills.service';
import { VisibilityStatus } from './profiles.constants';
import { SkillType } from '../skills/skills.constants';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { ResourceTypes } from '../../common/constants/index.constants';
import { CommentsService } from './../comments/comments.service';
import { User } from '../users/entities/user.entity';
import { Follower } from '../followers/entities/follower.entity';
import { ProfileStatus } from './profiles.constants';
import { NotificationsService } from '../notifications/notifications.service';
import {
  NotificationCategories,
  NotificationTypes,
} from '../notifications/notifications.constant';

export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly skillsService: SkillsService,
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
    @InjectRepository(Follower)
    private readonly followersRepository: Repository<Follower>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAllProfiles(
    page: number = 1,
    limit: number = 10,
    currentUserProfileId: string,
    skills?: string[],
    location?: string,
    languages?: string[],
    status?: ProfileStatus,
    keyword?: string,
    is_mentor?: boolean,
  ) {
    const queryBuilder = this.profilesRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.skills', 'skills')
      .leftJoinAndSelect('profile.events', 'events')
      .leftJoinAndSelect('profile.jobs', 'jobs')
      .leftJoinAndSelect('profile.articles', 'articles')
      .leftJoinAndSelect('comments.owner', 'owner')
      .where('profile.visibility_status = :visibility_status', {
        visibility_status: VisibilityStatus.PUBLIC,
      })
      .andWhere('profile.uuid != :currentUserProfileId', {
        currentUserProfileId,
      })
      .andWhere('profile.created_at != profile.updated_at');

    if (skills && skills.length > 0) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('skillProfile.profile_id')
          .from('profiles_skills', 'skillProfile')
          .innerJoin('skills', 's', 'skillProfile.skill_id = s.id')
          .where('s.title IN (:...skills)', {
            skills: skills.map((s) => s.toLowerCase()),
          })
          .groupBy('skillProfile.profile_id')
          .having('COUNT(skillProfile.skill_id) >= :skillCount', {
            skillCount: skills.length,
          })
          .getQuery();
        return `profile.id IN (${subQuery})`;
      });
    }

    if (location) {
      queryBuilder.andWhere('profile.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    if (languages && languages.length > 0) {
      queryBuilder.andWhere(
        'profile.languages && ARRAY[:...languages]::varchar[]',
        {
          languages,
        },
      );
    }

    if (status) {
      queryBuilder.andWhere('profile.status = :status', { status });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('profile.title LIKE :keyword', {
            keyword: `%${keyword}%`,
          })
            .orWhere('profile.heading LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('profile.bio LIKE :keyword', {
              keyword: `%${keyword}%`,
            });
        }),
      );
    }

    if (is_mentor) {
      queryBuilder.andWhere('profile.is_mentor = :isMentor', {
        isMentor: true,
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOneProfile(currentUserProfileId: string, profileId: string) {
    const profile = await this.profilesRepository.findOne({
      where: { uuid: profileId },
      relations: [
        'skills',
        'events',
        'jobs',
        'articles',
        'followers',
        'following',
        'followers.user',
        'following.user',
      ],
    });

    if (!profile) throw new NotFoundException('Profile not found');

    currentUserProfileId !== profile.uuid && this.updateProfileViews(profileId);

    return profile;
  }

  async updateProfileViews(profileId: string) {
    const profile = await this.profilesRepository.findOne({
      where: { uuid: profileId },
    });

    if (!profile) throw new NotFoundException('Profile does not exist');
    Object.assign(profile, { ...profile, views: ++profile.views });

    return await this.profilesRepository.save(profile);
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.profilesRepository.findOne({
      where: { user: { uuid: userId } },
      relations: ['user'],
    });

    return profile;
  }

  async getProfilesByUserIds(userIds: string[]) {
    const profiles = await this.profilesRepository.find({
      where: {
        user: { uuid: In(userIds) },
      },
    });

    return profiles;
  }

  async getProfilesByProfileIds(profileIds: string[]) {
    const profiles = await this.profilesRepository.find({
      where: {
        uuid: In(profileIds),
      },
    });

    return profiles;
  }

  async updateProfile(
    profileId: string,
    dto: Partial<CreateOrUpdateProfileDto>,
    userProfile: Profile,
  ) {
    if (userProfile.uuid !== profileId) throw new ForbiddenException();

    const profile = await this.profilesRepository.findOne({
      where: { uuid: profileId },
      relations: ['user'],
    });

    if (!profile) {
      throw new BadRequestException('Profile update failed');
    }

    Object.assign(profile, {
      ...dto,
      views:
        !profile.views && typeof profile.views !== 'number' ? 0 : profile.views,
    });

    profile.skills = [];
    for await (const skill of dto.skills) {
      const savedSkill = await this.skillsService.findOrCreateSkill(
        skill,
        profile,
        SkillType.PROFILE,
      );

      profile.skills.push(savedSkill);
    }

    const savedProfile = await this.profilesRepository.save(profile);

    return savedProfile;
  }

  async addComment(
    user: User,
    profileId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const profile = await this.profilesRepository.findOne({
      where: { uuid: profileId },
    });

    if (!profile) throw new NotFoundException('Profile does not exist');

    const comment = await this.commentsService.createComment(
      user,
      profile,
      ResourceTypes.PROFILE,
      createCommentDto,
    );

    // const activityData = { type: ActivityTypes.COMMENT };
    // this.activitiesService.createActivity(
    //   user.profile,
    //   profile,
    //   ResourceTypes.PROFILE,
    //   activityData,
    // );

    return comment;
  }

  async deleteComment(commentId: string, profileId: string) {
    return await this.commentsService.deleteComment(commentId, profileId);
  }

  async followUser(
    followedUserProfileId: string,
    profile: Profile,
    user: User,
  ) {
    if (followedUserProfileId === profile.uuid)
      throw new ConflictException('Users cannot follow themselves.');

    const followedUser = await this.usersRepository.findOne({
      where: { profile: { uuid: followedUserProfileId } },
      relations: ['profile'],
    });

    if (!followedUser) throw new NotFoundException('User does not exist');

    const followedUserProfile = followedUser.profile;

    const existingFollow = await this.followersRepository.findOne({
      where: {
        user: { uuid: followedUserProfileId },
        follower: { uuid: profile.uuid },
      },
    });

    if (existingFollow) {
      return existingFollow;
    }

    const newFollower = this.followersRepository.create();

    newFollower.follower = profile;
    newFollower.user = followedUserProfile;

    const savedFollower = await this.followersRepository.save(newFollower);

    try {
      this.notificationsService.createNotification(
        user,
        {
          resource_type: ResourceTypes.PROFILE,
          category: NotificationCategories.PROFILE_FOLLOW,
          type: [NotificationTypes.PUSH],
        },
        followedUser.profile,
      );
    } catch (e) {
      this.logger.error('An error occurred creating notification');
    }

    return savedFollower;
  }

  async unfollowUser(followedUserProfileId: string, profile: Profile) {
    if (followedUserProfileId === profile.uuid)
      throw new ConflictException('Users cannot unfollow themselves.');

    const followedUser = await this.profilesRepository.findOne({
      where: { uuid: followedUserProfileId },
    });

    if (!followedUser) throw new NotFoundException('User does not exist');

    const existingFollow = await this.followersRepository.findOne({
      where: {
        user: { uuid: followedUserProfileId },
        follower: { uuid: profile.uuid },
      },
    });

    if (!existingFollow) {
      throw new BadRequestException('User is not followed');
    }

    return await this.followersRepository.remove(existingFollow);
  }

  async getFollowing(profile: Profile) {
    const followers = await this.followersRepository.find({
      where: { user: { uuid: profile.uuid } },
      relations: ['follower'],
    });

    const following = await this.followersRepository.find({
      where: { follower: { uuid: profile.uuid } },
      relations: ['user'],
    });

    return { followers, following };
  }
}
