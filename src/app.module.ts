import { AppDataSource } from './../data-source';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { LoggerModule } from 'nestjs-pino';
// import { APP_FILTER } from '@nestjs/core';
// import { SentryModule } from '@sentry/nestjs/setup';
// import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { ThrottlerModule } from '@nestjs/throttler';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ApiKeyMiddleware } from './common/middleware';

import databaseConfig from './common/config/database.config';
import { UsersModule } from './core/users/users.module';
import { ProfilesModule } from './core/profiles/profiles.module';
import { EventsModule } from './core/events/events.module';
import { AuthModule } from './core/auth/auth.module';
import redisConfig from './common/config/redis.config';
import { NotificationsModule } from './core/notifications/notifications.module';
import { FileUploadModule } from './utilities/file-uploads/file-uploads.module';
import { JobsModule } from './core/jobs/jobs.module';
// import { AppGatewayModule } from './utilities/gateway/gateway.module';
import { SkillsModule } from './core/skills/skills.module';
import { ArticlesModule } from './core/articles/articles.module';
import { RecommendationsModule } from './core/recommendations/recommendations.module';
import { LocationsModule } from './core/locations/locations.module';
@Module({
  imports: [
    // SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [databaseConfig, redisConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: async () => AppDataSource.options,
    }),
    // LoggerModule.forRoot({
    //   pinoHttp: {
    //     level: 'info',
    //     transport: {
    //       target: 'pino-pretty',
    //       options: {
    //         colorize: true,
    //         translateTime: 'SYS:standard',
    //         ignore: 'pid,hostname',
    //       },
    //     },
    //   },
    // }),
    UsersModule,
    ProfilesModule,
    JobsModule,
    EventsModule,
    AuthModule,
    NotificationsModule,
    FileUploadModule,
    // AppGatewayModule,
    SkillsModule,
    ArticlesModule,
    RecommendationsModule,
    LocationsModule,
  ],
  // providers: [
  //   {
  //     provide: APP_FILTER,
  //     useClass: SentryGlobalFilter,
  //   },
  // ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
