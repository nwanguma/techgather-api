import { RecommendationsService } from './recommendations.service';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { RecommendationDto } from './dtos/recommendation.dto';
import { User } from '../users/entities/user.entity';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(RecommendationDto))
  async getRecommendations(@GetCurrentUser() user: User) {
    return await this.recommendationsService.getRecommendations(user);
  }
}
