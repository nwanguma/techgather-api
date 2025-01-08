import {
  Controller,
  Post,
  Delete,
  Get,
  Put,
  Body,
  Param,
  UseInterceptors,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';

import { FollowerFollowingDto } from '../followers/dtos/follower-following.dto';
import { ProfilesService } from './profiles.service';
import { CreateOrUpdateProfileDto } from './dtos/create-update-profile.dto';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { ProfileDto, PaginatedLimitedProfileDto } from './dtos/profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Profile } from './entities/profile.entity';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { GetCurrentUser } from './../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CommentDto } from '../comments/dtos/comment.dto';
import { ProfileStatus } from './profiles.constants';
import { ProfileCheckGuard } from '../auth/guards/profile-check';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(PaginatedLimitedProfileDto))
  async getAllProfiles(
    @GetCurrentUser('profile') profile: Profile,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('skills') skills?: string[],
    @Query('location') location?: string,
    @Query('languages') languages?: string[],
    @Query('status') status?: ProfileStatus,
    @Query('keyword') keyword?: string,
    @Query('is_mentor') is_mentor?: boolean,
  ) {
    return await this.profilesService.getAllProfiles(
      page,
      limit,
      profile.uuid,
      skills,
      location,
      languages,
      status,
      keyword,
      is_mentor,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ProfileDto))
  async getOneProfile(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.profilesService.getOneProfile(profile.uuid, id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ProfileDto))
  async updateProfile(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
    @Body() dto: CreateOrUpdateProfileDto,
  ) {
    return await this.profilesService.updateProfile(id, dto, profile);
  }

  @Get('connections/all')
  @UseInterceptors(new CustomSerializerInterceptor(FollowerFollowingDto))
  @UseGuards(JwtAuthGuard)
  async getFollowing(@GetCurrentUser('profile') profile: Profile) {
    return await this.profilesService.getFollowing(profile);
  }

  @Post(':profileId/comments')
  @UseGuards(ProfileCheckGuard)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(CommentDto))
  async addComment(
    @GetCurrentUser() user: User,
    @Param('profileId')
    profileId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.profilesService.addComment(
      user,
      profileId,
      createCommentDto,
    );
  }

  @Delete(':profileId/:commentId/comments')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @GetCurrentUser('profile') profile: Profile,
    @Param('commentId') commentId: string,
  ) {
    return await this.profilesService.deleteComment(commentId, profile.uuid);
  }

  @Patch(':followedUserProfileId/follow')
  @UseGuards(ProfileCheckGuard)
  @UseGuards(JwtAuthGuard)
  async followUser(
    @GetCurrentUser() user: User,
    @Param('followedUserProfileId') followedUserProfileId: string,
  ) {
    return await this.profilesService.followUser(
      followedUserProfileId,
      user.profile,
      user,
    );
  }

  @Patch(':followedUserProfileId/unfollow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @GetCurrentUser() user: User,
    @Param('followedUserProfileId') followedUserProfileId: string,
  ) {
    return await this.profilesService.unfollowUser(
      followedUserProfileId,
      user.profile,
    );
  }
}
