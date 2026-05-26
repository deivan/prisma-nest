import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';

@Module({
  providers: [WebsocketGateway, WebsocketService],
  // Експортуємо сервіс, якщо іншим модулям знадобиться відправляти повідомлення
  exports: [WebsocketService], 
})
export class WebsocketModule {}
