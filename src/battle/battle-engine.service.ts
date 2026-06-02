import { Injectable } from '@nestjs/common';
import { BattleRoom, Move } from './battle.interface';

@Injectable()
export class BattleEngineService {
  // Константи балансу гри (пізніше можна винести в конфіг)
  private readonly BLOCK_MITIGATION = 1; // Значення, на яке зменшується шкода при вдалому блоці
  public readonly INITIAL_HEALTH = 10;
  public readonly BASE_STRIKE = 3;
  public readonly ROUND_DURATION = 30000; // 30 секунд у мілісекундах

  /**
   * Розраховує шкоду від одного удару
   */
private calculateDamage(
    attackZone: string | null, 
    defenseZone: string | null, 
    strikePower: number = this.BASE_STRIKE
  ): number {
    if (!attackZone || strikePower === 0) return 0; // Атаки не було або сила 0
    if (!defenseZone) return strikePower;          // Захисту не було — повна шкода

    if (attackZone === defenseZone) {
      return Math.max(0, strikePower - this.BLOCK_MITIGATION);
    }
    return strikePower;
  }

  /**
   * Обробляє поточний стан кімнати та визначає результати раунду,
   * якщо обидва гравці зробили хід.
   */
public processRound(room: BattleRoom): BattleRoom {
    const p1MovesCount = room.player1moves.length;
    const p2MovesCount = room.player2moves.length;

    // Раунд обробляється тільки якщо масиви рівні (обидва мають ходи для поточного раунду)
    if (p1MovesCount === 0 || p1MovesCount !== p2MovesCount) {
      return room;
    }

    const p1LatestMove = room.player1moves[p1MovesCount - 1];
    const p2LatestMove = room.player2moves[p2MovesCount - 1];

    const damageToP1 = this.calculateDamage(p2LatestMove.attackZone, p1LatestMove.defenseZone, p2LatestMove.strike);
    const damageToP2 = this.calculateDamage(p1LatestMove.attackZone, p2LatestMove.defenseZone, p1LatestMove.strike);

    room.player1CurrentHealth = Math.max(0, room.player1CurrentHealth - damageToP1);
    room.player2CurrentHealth = Math.max(0, room.player2CurrentHealth - damageToP2);

    if (room.player1CurrentHealth === 0 || room.player2CurrentHealth === 0) {
      room.status = 'finished';
      if (room.player1CurrentHealth === 0 && room.player2CurrentHealth === 0) {
        room.winnerId = null;
      } else if (room.player1CurrentHealth === 0) {
        room.winnerId = room.player2Id;
      } else {
        room.winnerId = room.player1Id;
      }
    } else {
      // Якщо бій триває, готуємо параметри для наступного раунду
      room.currentRound += 1;
      room.roundDeadline = Date.now() + this.ROUND_DURATION;
    }

    return room;
  }
}
