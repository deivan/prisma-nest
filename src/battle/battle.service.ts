import crypto from 'crypto';
import { Redis } from 'ioredis';

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';

import { DuelRequest, BattleRoom, Move } from './battle.interface';
import { MakeMoveDto } from './battle.dto';
import { BattleEngineService } from './battle-engine.service';

@Injectable()
export class BattleService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly battleEngine: BattleEngineService,
  ) {}


  async createDuelRequest(challengerId: number): Promise<DuelRequest> {
    // Для ID заявки можна використати атомарний інкремент Redis або просто timestamp
    const duelId = await this.redis.incr('duel:id:counter');
    
    const duelRequest: DuelRequest = {
      id: duelId,
      challengerId,
      status: 'pending',
      createdAt: Date.now(),
    };

    await this.redis.set(`duel_request:${duelId}`, JSON.stringify(duelRequest));
    // Додатково зберігаємо в список/множину для швидкого отримання всіх активних заявок
    await this.redis.sadd('duel_requests:pending', duelId);

    return duelRequest;
  }

  async getPendingRequests(): Promise<DuelRequest[]> {
    const duelIds = await this.redis.smembers('duel_requests:pending');
    if (!duelIds || duelIds.length === 0) return [];

    const keys = duelIds.map(id => `duel_request:${id}`);
    const rawRequests = await this.redis.mget(keys);

    return rawRequests
      .filter((req): req is string => req !== null)
      .map(req => JSON.parse(req) as DuelRequest);
  }

  async acceptDuelRequest(duelId: number, opponentId: number): Promise<{ duelRequest: DuelRequest, battleRoom: BattleRoom }> {
    const rawRequest = await this.redis.get(`duel_request:${duelId}`);
    if (!rawRequest) throw new NotFoundException('Заявка на двобій не знайдена');

    const duelRequest: DuelRequest = JSON.parse(rawRequest);

    if (duelRequest.status !== 'pending') {
      throw new BadRequestException('Заявка вже прийнята або відхилена');
    }
    if (duelRequest.challengerId === opponentId) {
      throw new BadRequestException('Неможливо прийняти власну заявку');
    }

    const roomId = crypto.randomUUID();

    // Оновлюємо статус заявки
    duelRequest.status = 'accepted';
    duelRequest.opponentId = opponentId;
    duelRequest.battleRoomId = roomId;

    // Створюємо кімнату для двобою
    const battleRoom: BattleRoom = {
      id: roomId,
      player1Id: duelRequest.challengerId,
      player2Id: opponentId,
      status: 'active',
      createdAt: Date.now(),
      player1CurrentHealth: this.battleEngine.INITIAL_HEALTH,
      player2CurrentHealth: this.battleEngine.INITIAL_HEALTH,
      player1moves: [],
      player2moves: [],
      currentRound: 0,
      roundDeadline: 0
    };

    // Транзакція або пайплайн для збереження атомарності
    const pipeline = this.redis.pipeline();

    pipeline.set(`duel_request:${duelId}`, JSON.stringify(duelRequest));
    pipeline.srem('duel_requests:pending', duelId);
    pipeline.set(`battle_room:${roomId}`, JSON.stringify(battleRoom));
    await pipeline.exec();

    return { duelRequest, battleRoom };
  }

  async makeMove(roomId: string, userId: number, dto: MakeMoveDto): Promise<BattleRoom> {
    const rawRoom = await this.redis.get(`battle_room:${roomId}`);
    if (!rawRoom) throw new NotFoundException('Кімната не знайдена');

    let room: BattleRoom = JSON.parse(rawRoom);

    if (room.status !== 'active') {
      throw new BadRequestException('Цей двобій вже завершено');
    }

    const isPlayer1 = room.player1Id === userId;
    const isPlayer2 = room.player2Id === userId;

    if (!isPlayer1 && !isPlayer2) {
      throw new BadRequestException('Ви не є учасником цього двобою');
    }

    // Захист від подвійного ходу в одному раунді
    if (isPlayer1 && room.player1moves.length > room.player2moves.length) {
      throw new BadRequestException('Ви вже зробили хід, очікуйте на супротивника');
    }
    if (isPlayer2 && room.player2moves.length > room.player1moves.length) {
      throw new BadRequestException('Ви вже зробили хід, очікуйте на супротивника');
    }

    // Формуємо об'єкт ходу, беручи поточне здоров'я ДО розрахунку цього раунду
    const move: Move = {
      playerId: userId,
      attackZone: dto.attackZone,
      defenseZone: dto.defenseZone,
      health: isPlayer1 ? room.player1CurrentHealth : room.player2CurrentHealth,
      strike: this.battleEngine.BASE_STRIKE, 
    };

    if (isPlayer1) {
      room.player1moves.push(move);
    } else {
      room.player2moves.push(move);
    }

    // Передаємо кімнату в рушій. Якщо обидва походили — здоров'я перерахується
    room = this.battleEngine.processRound(room);

    await this.redis.set(`battle_room:${roomId}`, JSON.stringify(room));
    return room;
  }

  async getBattleStatus(roomId: string): Promise<BattleRoom> {
    const rawRoom = await this.redis.get(`battle_room:${roomId}`);
    if (!rawRoom) throw new NotFoundException('Кімната не знайдена');
    
    // Можна додати фільтрацію і не віддавати `moves` супротивника, якщо раунд ще триває,
    // щоб уникнути читингу, але для початку віддаємо все
    return JSON.parse(rawRoom);
  }
}
