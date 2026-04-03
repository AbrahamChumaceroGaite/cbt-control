import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNumber, IsOptional, IsString }  from 'class-validator'
import { CourseRepository }               from '../../domain/course.repository'
import { CourseMapper }                   from '../course.mapper'
import type { CourseResponse }            from '@control-aula/shared'

export class UpdateCourseDto {
  @IsOptional() @IsString() name?:       string
  @IsOptional() @IsString() level?:      string
  @IsOptional() @IsString() parallel?:   string
  @IsOptional() @IsNumber() classCoins?: number
}

export class UpdateCourseCommand {
  constructor(public readonly id: string, public readonly dto: UpdateCourseDto) {}
}

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler implements ICommandHandler<UpdateCourseCommand, CourseResponse> {
  constructor(private readonly repo: CourseRepository) {}

  async execute({ id, dto }: UpdateCourseCommand): Promise<CourseResponse> {
    const course = await this.repo.update(id, dto)
    return CourseMapper.toResponse(course)
  }
}
