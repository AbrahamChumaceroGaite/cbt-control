// ── UI-layer types (used across page + section components) ──────────────────
export type Course  = { id: string; name: string; level: string; parallel: string; classCoins: number; _count?: { students: number } }
export type Student = { id: string; courseId: string; name: string; code: string; email: string | null; coins: number; tramos: { tramo: string }[]; course?: { name: string } }
export type Action  = { id: string; name: string; coins: number; category: string; affectsClass: boolean; affectsStudent: boolean; isActive: boolean }
export type Reward  = { id: string; name: string; description: string; icon: string; coinsRequired: number; type: string; isGlobal: boolean; isActive: boolean }
export type Log     = { id: string; coins: number; reason: string; createdAt: string; student?: { name: string } | null; action?: { name: string; category: string } | null }
export type Group   = { id: string; name: string; courseId: string; members: { id: string; studentId: string; student: { id: string; name: string; coins: number } }[] }
export type AppTab  = 'aula' | 'cursos' | 'estudiantes' | 'grupos' | 'acciones' | 'recompensas' | 'solicitudes' | 'usuarios'

// ── Prisma-layer types (used in services + API routes) ───────────────────────
export type CourseWithStudents = {
  id: string; name: string; level: string; parallel: string
  classCoins: number; createdAt: Date; updatedAt: Date
  students: StudentWithTramos[]
  _count?: { students: number }
}

export type StudentWithTramos = {
  id: string; courseId: string; code: string; name: string; email: string | null;
  coins: number; createdAt: Date
  tramos: { tramo: string; awardedAt: Date }[]
}

export type RewardFull = {
  id: string; name: string; description: string; icon: string
  coinsRequired: number; type: string; isGlobal: boolean; isActive: boolean
  createdAt: Date; updatedAt: Date
}

export type ActionFull = {
  id: string; name: string; coins: number; category: string
  affectsClass: boolean; affectsStudent: boolean; isActive: boolean
}

export type CoinLogFull = {
  id: string; courseId: string; studentId: string | null
  coins: number; reason: string; createdAt: Date
  student?: { name: string } | null
  action?: { name: string; category: string } | null
}

export type GroupFull = {
  id: string; name: string; courseId: string
  members: { id: string; studentId: string; student: { id: string; name: string; coins: number } }[]
}

export { ACTION_COLORS } from '@/data/tramos'
