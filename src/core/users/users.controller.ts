import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { User } from './entities/user.entity';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { UserDto } from './dtos/user.dto';

@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(UserDto))
  getCurrentUser(@GetCurrentUser() user: User) {
    return user;
  }
}
