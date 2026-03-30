import { ICommandHandler, CommandHandler }              from '@nestjs/cqrs'
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type }                                        from 'class-transformer'
import { StudentRepository }                           from '../../domain/student.repository'

class StudentImportItem {
  @IsString() @IsNotEmpty() name!:  string
  @IsOptional() @IsString() code?:  string
  @IsOptional() @IsString() email?: string
}

export class ImportStudentsDto {
  @IsString() @IsNotEmpty() courseId!: string
  @IsArray() @ValidateNested({ each: true }) @Type(() => StudentImportItem)
  students!: StudentImportItem[]
}

export class ImportStudentsCommand {
  constructor(public readonly dto: ImportStudentsDto) {}
}

@CommandHandler(ImportStudentsCommand)
export class ImportStudentsHandler implements ICommandHandler<ImportStudentsCommand, { count: number }> {
  constructor(private readonly repo: StudentRepository) {}

  async execute({ dto }: ImportStudentsCommand): Promise<{ count: number }> {
    const count = await this.repo.createMany(dto.courseId, dto.students)
    return { count }
  }
}
