import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  UseGuards, 
  Req, 
  ParseIntPipe 
} from '@nestjs/common';
import { BattleService } from './battle.service';
import { MakeMoveDto } from './battle.dto';

//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 

//@UseGuards(JwtAuthGuard)
@Controller() 
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post('duel-requests')
  async createDuelRequest(@Req() req) {
    const userId = req.user.id; // Очікується з JWT Payload
    return this.battleService.createDuelRequest(userId);
  }

  @Get('duel-requests')
  async getPendingRequests() {
    return this.battleService.getPendingRequests();
  }

  @Post('duel-requests/:id/accept')
  async acceptDuelRequest(
    @Param('id', ParseIntPipe) id: number, 
    @Req() req
  ) {
    const userId = req.user.id;
    return this.battleService.acceptDuelRequest(id, userId);
  }

  @Post('battles/:id/move')
  async makeMove(
    @Param('id') battleRoomId: string, 
    @Body() makeMoveDto: MakeMoveDto,
    @Req() req
  ) {
    const userId = req.user.id;
    return this.battleService.makeMove(battleRoomId, userId, makeMoveDto);
  }

  @Get('battles/:id/status')
  async getBattleStatus(@Param('id') battleRoomId: string) {
    return this.battleService.getBattleStatus(battleRoomId);
  }
}
