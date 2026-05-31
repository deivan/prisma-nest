// src/redis/redis.service.ts
import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  // Геттер для доступу до нативного клієнта ioredis
  get client(): Redis {
    return this.redisClient;
  }

  // Хук життєвого циклу для коректного закриття з'єднання
  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
