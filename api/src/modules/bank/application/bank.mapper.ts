import type { CoinTransactionResponse }  from '@control-aula/shared'
import type { TransactionWithRelations } from '../domain/transaction.entity'

export class BankMapper {
  static toResponse(entity: TransactionWithRelations): CoinTransactionResponse {
    return {
      id:          entity.id,
      fromStudent: {
        id:         entity.fromStudent.id,
        name:       entity.fromStudent.name,
        courseName: entity.fromStudent.course?.name ?? '',
      },
      toStudent: {
        id:         entity.toStudent.id,
        name:       entity.toStudent.name,
        courseName: entity.toStudent.course?.name ?? '',
      },
      amount:     entity.amount,
      tax:        entity.tax,
      status:     entity.status,
      notes:      entity.notes,
      adminNotes: entity.adminNotes,
      createdAt:  entity.createdAt instanceof Date
        ? entity.createdAt.toISOString()
        : entity.createdAt,
    }
  }
}
