import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }  from '@nestjs/cqrs'
import { JwtAuthGuard }          from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }       from '../../common/decorators/response-message.decorator'
import { GetCoursesQuery }       from './application/queries/get-courses.query'
import { GetCourseByIdQuery }    from './application/queries/get-course-by-id.query'
import { CreateCourseCommand, CreateCourseDto } from './application/commands/create-course.command'
import { UpdateCourseCommand, UpdateCourseDto } from './application/commands/update-course.command'
import { DeleteCourseCommand }   from './application/commands/delete-course.command'

@Controller('cursos')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll() {
    return this.qb.execute(new GetCoursesQuery())
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.qb.execute(new GetCourseByIdQuery(id))
  }

  @Post()
  @HttpCode(201)
  @ResponseMessage('Curso creado')
  create(@Body() dto: CreateCourseDto) {
    return this.cb.execute(new CreateCourseCommand(dto))
  }

  @Put(':id')
  @ResponseMessage('Curso actualizado')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.cb.execute(new UpdateCourseCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Curso eliminado')
  async delete(@Param('id') id: string) {
    await this.cb.execute(new DeleteCourseCommand(id))
  }
}
