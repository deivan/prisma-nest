export interface DuelRequest {
  id: number; // Або string, якщо вирішите використовувати UUID замість інкременту
  challengerId: number;
  opponentId?: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number; // Для Redis зручніше зберігати як timestamp (number), або ж можна Date
  battleRoomId?: string;
}

export interface Move {
  playerId: number;
  attackZone: 'head' | 'body' | 'legs';
  defenseZone: 'head' | 'body' | 'legs';
  health: number; // 10
  strike: number; // 3
}

export interface BattleRoom {
  id: string;
  player1Id: number;
  player2Id: number;
  status: 'active' | 'finished';
  createdAt: number;

  // Нові поля для контролю часу
  currentRound: number;       // Поточний номер раунду (починаючи з 1)
  roundDeadline: number;      // Timestamp (ms), до якого треба зробити хід
  
  // Додаємо поточне здоров'я для швидкого доступу
  player1CurrentHealth: number; 
  player2CurrentHealth: number; 

  player1moves: Move[];
  player2moves: Move[];
  winnerId?: number | null; // null може означати нічию
}
