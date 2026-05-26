import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './websocket.service';
import type { JoinRoomPayload, SendMessagePayload } from './ws-payload.interface';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Ін'єкція залежності сервісу
  constructor(private readonly wsService: WebsocketService) {}

  handleConnection(client: Socket) {
    console.log(`[WS] Підключення встановлено: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] З'єднання розірвано: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    client.join(payload.room);
    
    // Використовуємо сервіс для формування системного повідомлення
    const notice = this.wsService.generateSystemNotice('приєднався до кімнати', client.id);
    
    client.to(payload.room).emit('roomMessage', {
      senderId: 'System',
      message: notice,
      timestamp: new Date().toISOString(),
    });

    return { status: 'success', joinedRoom: payload.room };
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    // Делегуємо бізнес-логіку обробки повідомлення у сервіс
    const processedMessage = this.wsService.processNewMessage(client.id, payload.message);
    
    // Розсилаємо результат усім учасникам кімнати
    this.server.to(payload.room).emit('roomMessage', processedMessage);
  }
}
