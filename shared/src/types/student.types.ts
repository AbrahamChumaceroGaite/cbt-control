export type TramoEntry  = { tramo: string }

export type StudentResponse = {
  id:       string
  courseId: string
  name:     string
  code:     string
  email:    string | null
  coins:    number
  tramos:   TramoEntry[]
  course?:  { name: string }
}

export type CoinLogResponse = {
  id:        string
  coins:     number
  reason:    string
  createdAt: string
  student?:  { name: string } | null
  action?:   { name: string; category: string } | null
}

export type StudentInput = {
  courseId?: string
  name?:     string
  code?:     string
  email?:    string
  coins?:    number
}

export type AwardCoinInput = {
  courseId:   string
  studentId?: string
  actionId?:  string
  coins:      number
  reason:     string
}
