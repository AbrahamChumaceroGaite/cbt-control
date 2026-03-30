import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { CourseController }      from './course.controller'
import { CourseRepository }      from './domain/course.repository'
import { CourseRepositoryImpl }  from './infrastructure/course.repository.impl'
import { GetCoursesHandler }     from './application/queries/get-courses.query'
import { GetCourseByIdHandler }  from './application/queries/get-course-by-id.query'
import { CreateCourseHandler }   from './application/commands/create-course.command'
import { UpdateCourseHandler }   from './application/commands/update-course.command'
import { DeleteCourseHandler }   from './application/commands/delete-course.command'
import { AuthModule }            from '../auth/auth.module'

const handlers = [GetCoursesHandler, GetCourseByIdHandler, CreateCourseHandler, UpdateCourseHandler, DeleteCourseHandler]

@Module({
  imports:     [CqrsModule, AuthModule],
  controllers: [CourseController],
  providers:   [
    { provide: CourseRepository, useClass: CourseRepositoryImpl },
    ...handlers,
  ],
})
export class CourseModule {}
