import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }   from '@nestjs/cqrs'
import { JwtAuthGuard }           from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }             from '../../../common/guards/roles.guard'
import { Roles }                  from '../../../common/decorators/roles.decorator'
import { ResponseMessage }        from '../../../common/decorators/response-message.decorator'
import { ROLES }                  from '../../../common/constants'
import { GetStudentsQuery }       from '../application/queries/get-students.query'
import { CreateStudentCommand }   from '../application/commands/create-student.command'
import { CreateStudentDto }       from '../application/commands/create-student.dto'
import { ImportStudentsCommand }  from '../application/commands/import-students.command'
import { ImportStudentsDto }      from '../application/commands/import-students.dto'
import { UpdateStudentCommand }   from '../application/commands/update-student.command'
import { UpdateStudentDto }       from '../application/commands/update-student.dto'
import { DeleteStudentCommand }   from '../application/commands/delete-student.command'

@Controller('estudiantes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll(@Query('courseId') courseId?: string) {
    return this.qb.execute(new GetStudentsQuery(courseId))
  }

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Estudiante creado')
  create(@Body() dto: CreateStudentDto) {
    return this.cb.execute(new CreateStudentCommand(dto))
  }

  @Post('import')
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Estudiantes importados')
  import(@Body() dto: ImportStudentsDto) {
    return this.cb.execute(new ImportStudentsCommand(dto))
  }

  @Put(':id')
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Estudiante actualizado')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto) {
    return this.cb.execute(new UpdateStudentCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Estudiante eliminado')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.cb.execute(new DeleteStudentCommand(id))
  }
}
