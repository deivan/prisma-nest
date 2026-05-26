import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { RouletteModule } from './roulette/roulette.module';
import { WalletModule } from './wallet/wallet.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [UsersModule, PrismaModule, RouletteModule, WalletModule, WebsocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
