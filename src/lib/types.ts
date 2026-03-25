export type CourseWithStudents = {
  id: string; name: string; level: string; parallel: string
  plant: string; classPoints: number; createdAt: Date; updatedAt: Date
  students: StudentWithTramos[]
  _count?: { students: number }
}

export type StudentWithTramos = {
  id: string; courseId: string; code: string; name: string; email: string | null;
  points: number; createdAt: Date
  tramos: { tramo: string; awardedAt: Date }[]
}

export type RewardFull = {
  id: string; name: string; description: string; icon: string
  pointsRequired: number; type: string; isGlobal: boolean; isActive: boolean
  createdAt: Date; updatedAt: Date
}

export type ActionFull = {
  id: string; name: string; points: number; category: string
  affectsClass: boolean; affectsStudent: boolean; isActive: boolean
}

export type PointLogFull = {
  id: string; courseId: string; studentId: string | null
  points: number; reason: string; createdAt: Date
  student?: { name: string } | null
  action?: { name: string; category: string } | null
}

export type GroupFull = {
  id: string; name: string; courseId: string
  members: { id: string; studentId: string; student: { id: string; name: string; points: number } }[]
}

export { TRAMOS, ACTION_COLORS } from '@/data/tramos'
