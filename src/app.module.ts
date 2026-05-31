import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { RouletteModule } from './roulette/roulette.module';
import { WalletModule } from './wallet/wallet.module';
import { WebsocketModule } from './websocket/websocket.module';
import { BattleModule } from './battle/battle.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [UsersModule, PrismaModule, RouletteModule, WalletModule, WebsocketModule, BattleModule,
    ConfigModule.forRoot({ isGlobal: true }), // Глобальний доступ до конфігурації
    RedisModule.forRootAsync(), // Ініціалізація Redis з асинхронною конфігурацією
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
