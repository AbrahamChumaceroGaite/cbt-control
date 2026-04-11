import type { ImportStudentsDto } from './import-students.dto'

export class ImportStudentsCommand {
  constructor(public readonly dto: ImportStudentsDto) {}
}
