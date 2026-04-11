import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { CourseController }      from './presentation/course.controller'
import { CourseRepository }      from './domain/course.repository'
import { CourseRepositoryImpl }  from './infrastructure/course.repository.impl'
import { GetCoursesHandler }     from './application/queries/get-courses.handler'
import { GetCourseByIdHandler }  from './application/queries/get-course-by-id.handler'
import { CreateCourseHandler }   from './application/commands/create-course.handler'
import { UpdateCourseHandler }   from './application/commands/update-course.handler'
import { DeleteCourseHandler }   from './application/commands/delete-course.handler'
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
