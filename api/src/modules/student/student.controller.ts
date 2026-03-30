import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }  from '@nestjs/cqrs'
import { JwtAuthGuard }          from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }       from '../../common/decorators/response-message.decorator'
import { GetStudentsQuery }      from './application/queries/get-students.query'
import { CreateStudentCommand,  CreateStudentDto  } from './application/commands/create-student.command'
import { ImportStudentsCommand, ImportStudentsDto } from './application/commands/import-students.command'
import { UpdateStudentCommand,  UpdateStudentDto  } from './application/commands/update-student.command'
import { DeleteStudentCommand }  from './application/commands/delete-student.command'

@Controller('estudiantes')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll(@Query('courseId') courseId?: string) {
    return this.qb.execute(new GetStudentsQuery(courseId))
  }

  @Post()
  @HttpCode(201)
  @ResponseMessage('Estudiante creado')
  create(@Body() dto: CreateStudentDto) {
    return this.cb.execute(new CreateStudentCommand(dto))
  }

  @Post('import')
  @HttpCode(201)
  @ResponseMessage('Estudiantes importados')
  import(@Body() dto: ImportStudentsDto) {
    return this.cb.execute(new ImportStudentsCommand(dto))
  }

  @Put(':id')
  @ResponseMessage('Estudiante actualizado')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.cb.execute(new UpdateStudentCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Estudiante eliminado')
  async delete(@Param('id') id: string) {
    await this.cb.execute(new DeleteStudentCommand(id))
  }
}
