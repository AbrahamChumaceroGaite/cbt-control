import type { TransactionEntity, TransactionWithRelations } from './transaction.entity'
import type { StudentSearchResult } from '@control-aula/shared'

export abstract class BankRepository {
  abstract create(data: { fromStudentId: string; toStudentId: string; amount: number; notes?: string }): Promise<TransactionEntity>
  abstract findById(id: string): Promise<TransactionEntity | null>
  abstract findByStudent(studentId: string): Promise<TransactionWithRelations[]>
  abstract findAll(status?: string, studentId?: string): Promise<TransactionWithRelations[]>
  abstract update(id: string, data: { status: string; adminNotes?: string }): Promise<TransactionEntity>
  abstract countWeekly(fromStudentId: string, since: Date): Promise<number>
  abstract searchStudents(q: string, excludeId: string, courseId?: string): Promise<StudentSearchResult[]>
  abstract getCourses(): Promise<{ id: string; name: string }[]>
}
