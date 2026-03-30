import type { CoinLogResponse } from './student.types'

export type CourseResponse = {
  id:            string
  name:          string
  level:         string
  parallel:      string
  classCoins:    number
  studentCount?: number
}

/** Curso con historial de monedas (detalle de curso) */
export type CourseDetail = CourseResponse & { coinLogs?: CoinLogResponse[] }

export type CourseInput = { name: string; level: string; parallel: string }
