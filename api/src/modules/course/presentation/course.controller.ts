import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard }         from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }           from '../../../common/guards/roles.guard'
import { Roles }                from '../../../common/decorators/roles.decorator'
import { ResponseMessage }      from '../../../common/decorators/response-message.decorator'
import { ROLES }                from '../../../common/constants'
import { GetCoursesQuery }      from '../application/queries/get-courses.query'
import { GetCourseByIdQuery }   from '../application/queries/get-course-by-id.query'
import { CreateCourseCommand }  from '../application/commands/create-course.command'
import { CreateCourseDto }      from '../application/commands/create-course.dto'
import { UpdateCourseCommand }  from '../application/commands/update-course.command'
import { UpdateCourseDto }      from '../application/commands/update-course.dto'
import { DeleteCourseCommand }  from '../application/commands/delete-course.command'

@Controller('cursos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll() {
    return this.qb.execute(new GetCoursesQuery())
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.qb.execute(new GetCourseByIdQuery(id))
  }

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Curso creado')
  create(@Body() dto: CreateCourseDto) {
    return this.cb.execute(new CreateCourseCommand(dto))
  }

  @Put(':id')
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Curso actualizado')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseDto) {
    return this.cb.execute(new UpdateCourseCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Curso eliminado')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.cb.execute(new DeleteCourseCommand(id))
  }
}
