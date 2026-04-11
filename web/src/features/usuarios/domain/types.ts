import type { UserDetailResponse } from '@control-aula/shared'

// ── View Model ────────────────────────────────────────────────────────────────

/** User DTO enriched with display helpers. */
export interface UserViewModel extends UserDetailResponse {
  /** Primary display name: student.name → fullName → code */
  displayName: string
  /** First character of displayName, uppercased */
  initial: string
  /** True when pushSubscriptionCount > 0 */
  hasPush: boolean
}

// ── Form States ───────────────────────────────────────────────────────────────

export interface UserCreateForm {
  code:     string
  password: string
  role:     string
  fullName: string
}

export interface UserUpdateForm {
  fullName: string
  password: string  // empty string means no change
  isActive: boolean
}

// ── Filters ───────────────────────────────────────────────────────────────────

export type RoleFilter   = 'all' | 'admin' | 'student'
export type StatusFilter = 'all' | 'active' | 'inactive'
export type PushFilter   = 'all' | 'active' | 'inactive'

export interface UserFilters {
  role:   RoleFilter
  status: StatusFilter
  push:   PushFilter
  course: string
  from:   string
  to:     string
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const EMPTY_CREATE_FORM: UserCreateForm = {
  code: '', password: '', role: 'student', fullName: '',
}

export const EMPTY_UPDATE_FORM: UserUpdateForm = {
  fullName: '', password: '', isActive: true,
}

export const EMPTY_FILTERS: UserFilters = {
  role: 'all', status: 'all', push: 'all', course: '', from: '', to: '',
}

// ── Notification ──────────────────────────────────────────────────────────────

/** Notification item from the admin inbox endpoint. */
export interface NotificationItem {
  id:        string
  title:     string
  body:      string
  url:       string
  tag:       string
  isRead:    boolean
  createdAt: string
}

