import { Body, Controller, Get, HttpCode, Post, Query, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }   from '../../../common/guards/roles.guard'
import { Roles }        from '../../../common/decorators/roles.decorator'
import { ROLES }        from '../../../common/constants'
import { BackupService } from '../application/backup.service'

@Controller('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
export class BackupController {
  constructor(private readonly backup: BackupService) {}

  @Get()
  async download(
    @Res() res: Response,
    @Query('sections') sectionsParam?: string,
  ) {
    const sections = this.backup.parseSections(sectionsParam)
    const payload  = await this.backup.export(sections)
    const date     = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="backup-cbt-${date}.json"`)
    res.send(JSON.stringify(payload, null, 2))
  }

  @Post('restore')
  @HttpCode(200)
  restore(@Body() body: Record<string, unknown>) {
    return this.backup.restore(body)
  }
}
