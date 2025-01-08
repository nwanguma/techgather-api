import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Feedback } from './entities/feedback.entity';
import { FeedbacksService } from './feedbacks.service';
import { Profile } from '../profiles/entities/profile.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Profile]), NotificationsModule],
  providers: [FeedbacksService],
  exports: [FeedbacksService],
})
export class FeedbacksModule {}
