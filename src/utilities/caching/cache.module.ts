import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

import { CacheService } from './cache.service';

const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      url: configService.get<string>('redis.url'),
      password: configService.get<string>('redis.token'),
    });

    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule.forRoot(), CacheModule.registerAsync(RedisOptions)],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheServiceModule {}
