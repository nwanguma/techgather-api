import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReactionsService } from './reactions.service';
import { Reaction } from './entities/reaction.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, Profile]), NotificationsModule],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
