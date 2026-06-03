import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef, UseGuards } from '@nestjs/common';
import { BattleService } from './battle.service';
import { MakeMoveDto } from './battle.dto';

// Додаємо namespace для ізоляції ігрових сокетів
@WebSocketGateway({ namespace: '/battle', cors: true })
export class BattleGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server | undefined;

  constructor(
    @Inject(forwardRef(() => BattleService))
    private readonly battleService: BattleService,
  ) {}

  // Обробка підключення клієнта
  handleConnection(client: Socket) {
    console.log(`Клієнт підключився: ${client.id}`);
    // В реальному проекті тут варто дістати токен з client.handshake.headers.authorization
    // та валідувати користувача.
  }

  handleDisconnect(client: Socket) {
    console.log(`Клієнт відключився: ${client.id}`);
  }

  // Клієнт просить приєднатися до кімнати двобою
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    client.join(payload.roomId);
    console.log(`Клієнт ${client.id} приєднався до кімнати ${payload}`);
    
    // Можна одразу відправити йому поточний стан кімнати
    this.battleService.getBattleStatus(payload.roomId).then((room) => {
      client.emit('room_state', room);
    }).catch(() => {
      client.emit('error', { message: 'Кімната не знайдена' });
    });
  }

  // Клієнт робить хід через WebSocket
  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: number; move: MakeMoveDto },
  ) {
    try {
      // Викликаємо метод сервісу. Зверніть увагу: userId беремо з payload 
      // (але в продакшені його треба брати з авторизованого сокета, щоб уникнути читингу)
      // const room = await this.battleService.makeMove(
      //   payload.roomId,
      //   payload.userId,
      //   payload.move,
      // );

      // Сповіщаємо суперника, що хід зроблено (але не показуємо куди саме)
      client.to(payload.roomId).emit('opponent_moved', { 
        userId: payload.userId, 
        message: 'Супротивник зробив хід' 
      });

    } catch (error) {
      // Відправляємо помилку тільки тому клієнту, який зробив неправильний запит
      client.emit('battle_error', { message: error.message });
    }
  }

  // --- Метод для виклику із BattleService ---
  // Дозволяє сервісу розсилати повідомлення всім у кімнаті
  broadcastToRoom(roomId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(roomId).emit(event, data);
    }
  }

  broadcastAll(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }
}