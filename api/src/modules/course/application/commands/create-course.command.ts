import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNotEmpty, IsString }            from 'class-validator'
import { CourseRepository }               from '../../domain/course.repository'
import { CourseMapper }                   from '../course.mapper'
import type { CourseResponse }            from '@control-aula/shared'

export class CreateCourseDto {
  @IsString() @IsNotEmpty() name!:     string
  @IsString() @IsNotEmpty() level!:    string
  @IsString() @IsNotEmpty() parallel!: string
}

export class CreateCourseCommand {
  constructor(public readonly dto: CreateCourseDto) {}
}

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler implements ICommandHandler<CreateCourseCommand, CourseResponse> {
  constructor(private readonly repo: CourseRepository) {}

  async execute({ dto }: CreateCourseCommand): Promise<CourseResponse> {
    const course = await this.repo.create(dto)
    return CourseMapper.toResponse(course)
  }
}
