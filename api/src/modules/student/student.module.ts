import { Module }                  from '@nestjs/common'
import { CqrsModule }               from '@nestjs/cqrs'
import { StudentController }        from './presentation/student.controller'
import { StudentRepository }        from './domain/student.repository'
import { StudentRepositoryImpl }    from './infrastructure/student.repository.impl'
import { GetStudentsHandler }       from './application/queries/get-students.handler'
import { CreateStudentHandler }     from './application/commands/create-student.handler'
import { ImportStudentsHandler }    from './application/commands/import-students.handler'
import { UpdateStudentHandler }     from './application/commands/update-student.handler'
import { DeleteStudentHandler }     from './application/commands/delete-student.handler'
import { AuthModule }               from '../auth/auth.module'

const handlers = [GetStudentsHandler, CreateStudentHandler, ImportStudentsHandler, UpdateStudentHandler, DeleteStudentHandler]

@Module({
  imports:     [CqrsModule, AuthModule],
  controllers: [StudentController],
  providers:   [
    { provide: StudentRepository, useClass: StudentRepositoryImpl },
    ...handlers,
  ],
})
export class StudentModule {}
