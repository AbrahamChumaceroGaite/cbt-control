export interface GroupMemberEntity {
  id:        string
  studentId: string
  student:   { id: string; name: string; coins: number }
}

export interface GroupEntity {
  id:        string
  name:      string
  courseId:  string
  createdAt: Date
  updatedAt: Date
  members:   GroupMemberEntity[]
}
