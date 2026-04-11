export interface SelectOption {
  value: string
  label: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page:  number
  pages: number
}

export type SortDirection = 'asc' | 'desc'

export interface UploadState {
  file:      File | null
  preview:   string | null
  uploading: boolean
}
