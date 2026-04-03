export type UserRole = 'admin' | 'student'

export type SessionPayload = {
  userId:     string
  role:       UserRole
  studentId?: string
  code:       string
  fullName:   string
}

export type UserResponse = {
  id:       string
  name:     string
  email:    string
  role:     UserRole
  isActive: boolean
}

/** Usuario del sistema con relación al alumno (lista de administración) */
export type UserDetailResponse = {
  id:                    string
  code:                  string
  role:                  UserRole
  fullName:              string
  isActive:              boolean
  createdAt:             string
  student?:              { id: string; name: string; course?: { name: string } } | null
  pushSubscriptionCount: number
  notificationCount:     number
}

export type UserCreateInput = {
  code:       string
  password:   string
  role:       string
  fullName?:  string
  studentId?: string
}
