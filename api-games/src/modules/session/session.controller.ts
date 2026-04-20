import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { Request }                                 from 'express'
import { JwtAuthGuard }                            from '../../common/guards/jwt-auth.guard'
import type { SessionPayload }                     from '@control-aula/shared'
import { SessionService }                          from './session.service'
import { LevelCompleteDto }                        from './dtos/level-complete.dto'
import { ContinueGameDto }                         from './dtos/continue-game.dto'

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('level-complete')
  async levelComplete(
    @Body() dto: LevelCompleteDto,
    @Req() req: Request & { user: SessionPayload },
  ) {
    const { role, studentId } = req.user

    if (role === 'student' && studentId) {
      return this.sessionService.completeLevel(
        studentId,
        dto.gameSlug,
        dto.levelNumber,
        dto.idempotencyKey,
      )
    }

    return { coinsEarned: 0, newBalance: 0, alreadyApplied: false }
  }

  @Post('continue')
  async continueGame(
    @Body() dto: ContinueGameDto,
    @Req() req: Request & { user: SessionPayload },
  ) {
    const { role, studentId } = req.user

    if (role === 'student' && studentId) {
      return this.sessionService.useContinue(
        studentId,
        dto.gameSlug,
        dto.idempotencyKey,
      )
    }

    return { coinsSpent: 0, newBalance: 0 }
  }
}
