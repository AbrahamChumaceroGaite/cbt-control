import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { StudentRepository } from '../../domain/student.repository'
import { StudentMapper }     from '../student.mapper'
import type { StudentResponse } from '@control-aula/shared'

export class CreateStudentDto {
  @IsString()  @IsNotEmpty() courseId!: string
  @IsString()  @IsNotEmpty() name!:     string
  @IsOptional() @IsString()  code?:     string
  @IsOptional() @IsString()  email?:    string
  @IsOptional() @IsNumber()  coins?:    number
}

export class CreateStudentCommand {
  constructor(public readonly dto: CreateStudentDto) {}
}

@CommandHandler(CreateStudentCommand)
export class CreateStudentHandler implements ICommandHandler<CreateStudentCommand, StudentResponse> {
  constructor(private readonly repo: StudentRepository) {}

  async execute({ dto }: CreateStudentCommand): Promise<StudentResponse> {
    const student = await this.repo.create(dto)
    return StudentMapper.toResponse(student)
  }
}
