import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  Patch,
  Get,
  Param,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { RequestWithUser } from '../../common/classes/request';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTokensDto } from './dtos/create-refresh-token.dto';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthDto } from './dtos/auth.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { InitiateResetPasswordDto } from './dtos/initiate-reset-password.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(AuthDto))
  async login(@Req() req: RequestWithUser) {
    return await this.authService.login(req.user);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  @UseInterceptors(new CustomSerializerInterceptor(AuthDto))
  async register(@Body() body: CreateUserDto) {
    return await this.authService.register(body);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(
    @GetCurrentUser() user: User,
    @Body() createTokensDto: CreateTokensDto,
  ) {
    return await this.authService.refreshToken(user, createTokensDto);
  }

  @Patch('activate/:token')
  @UseGuards(JwtAuthGuard)
  async activateUser(
    @GetCurrentUser() user: User,
    @Param('token') token: string,
  ) {
    return await this.authService.activateUser(user, token);
  }

  @Get('reset-password')
  async initiateResetPassword(
    @GetCurrentUser() user: User,
    @Body() initiateResetPasswordDto: InitiateResetPasswordDto,
  ) {
    return await this.authService.initiateResetPassword(
      initiateResetPasswordDto,
    );
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword(token, resetPasswordDto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetCurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user, changePasswordDto);
  }
}
