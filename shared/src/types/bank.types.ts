export type CoinTransactionResponse = {
  id:          string
  fromStudent: { id: string; name: string; courseName: string }
  toStudent:   { id: string; name: string; courseName: string }
  amount:      number
  tax:         number
  status:      string  // "pending" | "approved" | "rejected"
  notes:       string
  adminNotes:  string
  createdAt:   string
}

export type WeeklyBankStatus = {
  used:      number
  limit:     number
  remaining: number
}

export type StudentSearchResult = {
  id:         string
  name:       string
  courseName: string
  avatarUrl?: string
}

export type CreateTransactionInput = {
  toStudentId: string
  amount:      number
  notes?:      string
}

export type ProcessTransactionInput = {
  status:     'approved' | 'rejected'
  adminNotes?: string
}
