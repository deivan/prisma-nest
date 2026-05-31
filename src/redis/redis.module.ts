// src/redis/redis.module.ts
import { Global, Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';


@Global()
@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    const redisProvider: Provider = {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', ''),
          // Додаткові налаштування для стабільності
          retryStrategy(times) {
            return Math.min(times * 50, 2000);
          },
        });
      },
      inject: [ConfigService],
    };

    return {
      module: RedisModule,
      global: true, // ось тут прилітала помилка "Nest can't resolve dependencies of the RedisService (?). Please make sure that the argument REDIS_CLIENT at index [0] is available in the RedisModule context."
      providers: [redisProvider, RedisService],
      exports: [RedisService, 'REDIS_CLIENT'],
    };
  }
}
