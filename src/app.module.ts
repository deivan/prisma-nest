import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'), 
      serveRoot: '/',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
