import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'
import { StudentRepository } from '../../domain/student.repository'
import { StudentMapper }     from '../student.mapper'
import { SocketService }   from '../../../../infrastructure/socket/socket.service'
import type { StudentResponse } from '@control-aula/shared'

export class UpdateStudentDto {
  @IsOptional() @IsString() name?:    string
  @IsOptional() @IsString() code?:    string
  @IsOptional() @IsString() email?:   string
  @IsOptional() @IsNumber() coins?:   number
  @IsOptional() @IsArray()  tramos?:  string[]
}

export class UpdateStudentCommand {
  constructor(public readonly id: string, public readonly dto: UpdateStudentDto) {}
}

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
