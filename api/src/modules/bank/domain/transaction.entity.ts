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
