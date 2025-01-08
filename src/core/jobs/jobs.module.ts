import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Job } from './entities/job.entity';
import { JobsController } from './jobs.controllers';
import { JobsService } from './jobs.service';
import { SkillsModule } from '../skills/skills.module';
import { Profile } from '../profiles/entities/profile.entity';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { ReactionsModule } from '../reactions/reactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Profile]),
    UsersModule,
    SkillsModule,
    CommentsModule,
    ReactionsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
