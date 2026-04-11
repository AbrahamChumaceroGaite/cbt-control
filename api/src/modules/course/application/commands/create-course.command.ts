import type { CreateCourseDto } from './create-course.dto'

export class CreateCourseCommand {
  constructor(public readonly dto: CreateCourseDto) {}
}
