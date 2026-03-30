export type GroupMember = {
  id:        string
  studentId: string
  student:   { id: string; name: string; coins: number }
}

export type GroupResponse = {
  id:       string
  name:     string
  courseId: string
  members:  GroupMember[]
}

export type GroupInput = {
  name:        string
  courseId?:   string
  studentIds?: string[]
}
