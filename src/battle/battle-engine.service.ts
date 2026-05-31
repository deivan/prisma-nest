import { Injectable } from '@nestjs/common';
import { BattleRoom, Move } from './battle.interface';

@Injectable()
export class BattleEngineService {
  // Константи балансу гри (пізніше можна винести в конфіг)
  private readonly BLOCK_MITIGATION = 2; // Значення, на яке зменшується шкода при вдалому блоці
  public readonly INITIAL_HEALTH = 10;
  public readonly BASE_STRIKE = 3;

  /**
   * Розраховує шкоду від одного удару
   */
  private calculateDamage(attackZone: string, defenseZone: string, strikePower: number): number {
    if (attackZone === defenseZone) {
      // Вдалий захист: удар частково поглинається
      return Math.max(0, strikePower - this.BLOCK_MITIGATION);
    }
    // Пропущений удар: повна шкода
    return strikePower;
  }

  /**
   * Обробляє поточний стан кімнати та визначає результати раунду,
   * якщо обидва гравці зробили хід.
   */
  public processRound(room: BattleRoom): BattleRoom {
    const p1MovesCount = room.player1moves.length;
    const p2MovesCount = room.player2moves.length;

    // Перевіряємо, чи обидва гравці зробили хід у поточному раунді
    if (p1MovesCount === 0 || p1MovesCount !== p2MovesCount) {
      // Раунд ще не завершено (хтось очікує ходу супротивника)
      return room;
    }

    // Беремо останні ходи обох гравців
    const p1LatestMove = room.player1moves[p1MovesCount - 1];
    const p2LatestMove = room.player2moves[p2MovesCount - 1];

    // Розраховуємо отриману шкоду (хрест-навхрест)
    const damageToP1 = this.calculateDamage(p2LatestMove.attackZone, p1LatestMove.defenseZone, p2LatestMove.strike);
    const damageToP2 = this.calculateDamage(p1LatestMove.attackZone, p2LatestMove.defenseZone, p1LatestMove.strike);

    // Оновлюємо поточне здоров'я в кімнаті
    room.player1CurrentHealth = Math.max(0, room.player1CurrentHealth - damageToP1);
    room.player2CurrentHealth = Math.max(0, room.player2CurrentHealth - damageToP2);

    // Перевіряємо умови завершення двобою
    if (room.player1CurrentHealth === 0 || room.player2CurrentHealth === 0) {
      room.status = 'finished';

      if (room.player1CurrentHealth === 0 && room.player2CurrentHealth === 0) {
        room.winnerId = null; // Нічия: обидва впали одночасно
      } else if (room.player1CurrentHealth === 0) {
        room.winnerId = room.player2Id; // Переміг гравець 2
      } else {
        room.winnerId = room.player1Id; // Переміг гравець 1
      }
    }

    return room;
  }
}
