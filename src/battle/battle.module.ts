import { Module } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { BattleEngineService } from './battle-engine.service';
import { BattleGateway } from './battle.gateway';

// Якщо у вас Redis обгорнуто в окремий модуль, підключіть його сюди
// import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    // RedisModule 
  ],
  controllers: [BattleController],
  providers: [BattleService, BattleEngineService, BattleGateway],
  exports: [BattleService], // Експортуємо сервіс, якщо він знадобиться у Gateway на наступному етапі
})
export class BattleModule {}
