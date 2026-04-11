export interface ExportSection {
  key:   string
  label: string
  desc:  string
}

export type RestoreDetail = { created: number; updated?: number }

export interface RestoreResult {
  detected: string[]
  details: {
    courses?:     RestoreDetail
    students?:    RestoreDetail
    groups?:      RestoreDetail
    actions?:     RestoreDetail
    rewards?:     RestoreDetail
    coinLogs?:    RestoreDetail
    solicitudes?: RestoreDetail
  }
}
