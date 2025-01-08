import { SkillsService } from './skills.service';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { SkillDto } from './dtos/skill.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(SkillDto))
  async getCurrentUser() {
    return await this.skillsService.listAllSkills();
  }
}
