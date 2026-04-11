import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { StudentResponse }  from '@control-aula/shared'
import { StudentRepository }     from '../../domain/student.repository'
import { StudentMapper }         from '../student.mapper'
import { SocketService }         from '../../../../infrastructure/socket/socket.service'
import { UpdateStudentCommand }  from './update-student.command'

@CommandHandler(UpdateStudentCommand)
export class UpdateStudentHandler implements ICommandHandler<UpdateStudentCommand, StudentResponse> {
  constructor(
    private readonly repo:     StudentRepository,
    private readonly realtime: SocketService,
  ) {}

  async execute({ id, dto }: UpdateStudentCommand): Promise<StudentResponse> {
    const student = await this.repo.update(id, dto)

    // Emit coins:updated only when coins were explicitly changed
    if (dto.coins !== undefined) {
      this.realtime.coinsUpdated({
        courseId:     student.courseId,
        classCoins:   student.course?.classCoins,
        studentId:    student.id,
        studentCoins: student.coins,
      })
    }

    return StudentMapper.toResponse(student)
  }
}
