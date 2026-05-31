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
  id: string; // UUID кімнати
  player1Id: number;
  player2Id: number;
  status: 'active' | 'finished';
  createdAt: number;
  player1moves: Move[];
  player2moves: Move[];
  winnerId?: number;
}