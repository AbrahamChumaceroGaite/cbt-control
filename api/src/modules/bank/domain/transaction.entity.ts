export interface TransactionEntity {
  id:            string
  fromStudentId: string
  toStudentId:   string
  amount:        number
  tax:           number
  status:        string
  notes:         string
  adminNotes:    string
  createdAt:     Date
  updatedAt:     Date
}

/** Shape returned by Prisma when a transaction is fetched with student+course includes */
export interface TransactionWithRelations {
  id:          string
  fromStudent: { id: string; name: string; course: { name: string } | null }
  toStudent:   { id: string; name: string; course: { name: string } | null }
  amount:      number
  tax:         number
  status:      string
  notes:       string
  adminNotes:  string
  createdAt:   Date | string
}
