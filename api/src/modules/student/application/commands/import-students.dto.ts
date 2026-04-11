import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

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
