import { Injectable, Logger } from '@nestjs/common';
import { BroadcastMessage } from './ws-payload.interface';

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);

  // Імітація збереження повідомлення в БД або перевірки на спам
  processNewMessage(clientId: string, message: string): BroadcastMessage {
    this.logger.log(`Обробка повідомлення від ${clientId}`);
    
    // Тут могла б бути логіка валідації або збереження в PostgreSQL
    
    return {
      senderId: clientId,
      message: message,
      timestamp: new Date().toISOString(),
    };
  }

  generateSystemNotice(action: string, clientId: string): string {
    return `Користувач ${clientId} ${action}.`;
  }
}
