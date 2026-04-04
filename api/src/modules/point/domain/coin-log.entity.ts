export interface CoinLogEntity {
  id:        string
  courseId:  string
  studentId: string | null
  actionId:  string | null
  coins:     number
  reason:    string
  createdAt: Date
  student?:  { name: string } | null
  action?:   { name: string; category: string } | null
  // Populated by the repository after the transaction — used for real-time events
  updatedClassCoins?:   number
  updatedStudentCoins?: number
}
