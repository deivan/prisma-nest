import { Injectable } from '@nestjs/common';
import { CreateRouletteDto } from './dto/create-roulette.dto';
import { UpdateRouletteDto } from './dto/update-roulette.dto';

import * as crypto from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';
import { GameSession, Prisma } from '../../prisma/generated/prisma/client';

const GameRoom = '295d2985-2d44-4feb-8fa0-5e0c01ffd9f3';

const generateResult = (serverSeed: string, clientSeed: string, nonce: number) => {
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}`);

    const hash = hmac.digest('hex');
    const partialHash = hash.substring(0, 8);
    const intValue = parseInt(partialHash, 16);

    return intValue % 37;
}

@Injectable()
export class RouletteService {
  constructor(private prisma: PrismaService) {}
  
  async create() {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
    const gameRoom = await this.prisma.gameSession.create({
      data: {
        serverSeed,
        serverHash
      }
    });
    // GameRoom = gameRoom.id;
    return { success: true, gameRoom };
  }

  findAll() {
    return `This action returns all roulette`;
  }

  async spinOne(clientSeed: string) {
    const gameSession = await this.prisma.gameSession.findUnique({
      where: { id: GameRoom }
    });
    if (!gameSession) {
      return { success: false, message: 'Game session not found' };
    }
    const result = generateResult(gameSession.serverSeed, clientSeed, gameSession.nonce);
    await this.prisma.gameSession.update({
      where: { id: GameRoom },
      data: { nonce: gameSession.nonce + 1 }
    });
    await this.prisma.rouletteBet.create({
      data: {
        number: result,
        gameId: GameRoom,
        userId: 1, // Replace with actual user ID
        bet: 10 // Replace with actual bet amount
      }
    });

    return { success: true, result };
  }

  update(id: number, updateRouletteDto: UpdateRouletteDto) {
    return `This action updates a #${id} roulette`;
  }

  remove(id: number) {
    return `This action removes a #${id} roulette`;
  }
}
