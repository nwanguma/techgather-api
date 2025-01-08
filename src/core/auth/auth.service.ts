import { CreateTokensDto } from './dtos/create-refresh-token.dto';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CacheService } from '../../utilities/caching/cache.service';
import {
  NotificationCategories,
  NotificationTypes,
} from '../notifications/notifications.constant';
import { NotificationsService } from './../notifications/notifications.service';
import { UserStatus } from '../users/users.constants';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { InitiateResetPasswordDto } from './dtos/initiate-reset-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
    private readonly notificationsService: NotificationsService,
  ) {}
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findUserWithProfileByEmail(email);

    if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }

    return null;
  }

  async login(user: User) {
    const tokens = await this.generateAuthTokens(user);

    this.usersService.updateLastSeen(user);

    return {
      user,
      ...tokens,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    const tokens = await this.generateAuthTokens(user);

    try {
      await this.initUserVerification(user);
    } catch (e) {
      this.logger.error('Failed to send email ' + user.uuid);
    }

    return {
      user,
      ...tokens,
    };
  }

  async validateUserById(id: string) {
    const user = await this.usersService.getUserById(id);

    return user;
  }

  async generateAuthTokens(user: User) {
    const payload = { sub: user.uuid, email: user.email };
    const access_token = this.jwtService.sign(payload, { expiresIn: '3d' });
    // const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    // const refreshTokenDurationInMilliseconds = 60 * 60 * 24 * 7;
    // const refreshTokenCacheKey = 'refresh_token' + ':' + user.uuid;

    // try {
    //   await this.cacheService.set(
    // refreshTokenCacheKey,
    // refresh_token,
    // refreshTokenDurationInMilliseconds,
    //   );
    // } catch (e) {
    //   this.logger.error('Saving to cache failed: refresh_token', e);
    // }

    return {
      access_token,
      // refresh_token,
      // expires_in: 3600,
    };
  }

  async initUserVerification(user: User) {
    const cacheKey = 'activation_token' + ':' + user.uuid;
    const activationToken = uuidv4();

    const result = await this.cacheService.set(cacheKey, activationToken);

    await this.notificationsService.createNotification(user, {
      type: [NotificationTypes.EMAIL],
      content: activationToken,
      category: NotificationCategories.EMAIL_VERIFICATION,
    });

    return result;
  }

  async refreshToken(user: User, createTokensDto: CreateTokensDto) {
    const refreshTokenCacheKey = 'refresh_token' + ':' + user.uuid;
    const currentRefreshToken =
      await this.cacheService.get(refreshTokenCacheKey);

    if (currentRefreshToken != createTokensDto.refresh_token)
      throw new BadRequestException('Refresh token is invalid');

    await this.cacheService.del(refreshTokenCacheKey);

    return await this.generateAuthTokens(user);
  }

  async activateUser(user: User, token: string) {
    const cacheKey = 'activation_token' + ':' + user.uuid;
    const userActivationToken = await this.cacheService.get(cacheKey);

    if (user.status === UserStatus.ACTIVE)
      throw new UnprocessableEntityException('User already activated');

    if (userActivationToken !== token)
      throw new BadRequestException('Activation token is invalid');

    await this.usersService.activateUser(user.uuid);
    await this.cacheService.del(cacheKey);
  }

  async initiateResetPassword(
    initiateResetPasswordDto: InitiateResetPasswordDto,
  ) {
    const user = await this.usersService.findByEmail(
      initiateResetPasswordDto.email,
    );

    if (!user) throw new BadRequestException();

    const cacheKey = 'password_reset_token' + ':' + user.uuid;
    const resetToken = uuidv4();

    await this.cacheService.set(cacheKey, resetToken);
    await this.cacheService.set(resetToken, user.email);

    await this.notificationsService.createNotification(user, {
      type: [NotificationTypes.EMAIL],
      content: resetToken,
      category: NotificationCategories.PASSWORD_RESET,
    });
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const userEmail = await this.cacheService.get(token);

    if (!userEmail)
      throw new BadRequestException(
        'An error occurred, please contact support',
      );

    const user = await this.usersService.findByEmail(userEmail as string);
    const cacheKey = 'password_reset_token' + ':' + user.uuid;
    const savedToken = await this.cacheService.get(cacheKey);

    if (token !== savedToken) throw new ForbiddenException();

    await this.usersService.changePassword(user, resetPasswordDto.password);
    await this.notificationsService.createNotification(user, {
      type: [NotificationTypes.EMAIL],
      content: 'Password reset',
      category: NotificationCategories.PASSWORD_CHANGE,
    });
    await this.cacheService.del(token);
    await this.cacheService.del(cacheKey);
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    if (!bcrypt.compareSync(changePasswordDto.old_password, user.password)) {
      throw new BadRequestException('Old password is incorrect');
    }

    await this.usersService.changePassword(
      user,
      changePasswordDto.new_password,
    );

    return;
  }
}
