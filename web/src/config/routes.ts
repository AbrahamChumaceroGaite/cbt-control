// ── Next.js app routes (pages) ───────────────────────────────────────────────
export const APP_ROUTES = {
  LOGIN:     '/login',
  PORTAL:    '/portal',
  DASHBOARD: '/',
} as const

// ── NestJS backend API routes ────────────────────────────────────────────────
// Services MUST import from here. No '/api/...' strings anywhere else.
export const API_ROUTES = {
  AUTH: {
    LOGIN:   '/api/auth/login',
    LOGOUT:  '/api/auth/logout',
    ME:      '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  ACTIONS: {
    BASE:  '/api/acciones',
    BY_ID: (id: string) => `/api/acciones/${id}`,
  },
  COURSES: {
    BASE:  '/api/cursos',
    BY_ID: (id: string) => `/api/cursos/${id}`,
  },
  STUDENTS: {
    BASE:      '/api/estudiantes',
    BY_ID:     (id: string)  => `/api/estudiantes/${id}`,
    BY_COURSE: (cid: string) => `/api/estudiantes?courseId=${cid}`,
    IMPORT:    '/api/estudiantes/import',
  },
  GROUPS: {
    BASE:  '/api/grupos',
    BY_ID: (id: string) => `/api/grupos/${id}`,
  },
  REWARDS: {
    BASE:  '/api/recompensas',
    BY_ID: (id: string) => `/api/recompensas/${id}`,
  },
  POINTS: {
    AWARD: '/api/puntos',
  },
  BANK: {
    STATUS:         '/api/bank/status',
    TRANSACTIONS:   '/api/bank/transactions',
    COURSES:        '/api/bank/courses',
    SEARCH:         '/api/bank/search',
    ADMIN_TXS:      '/api/bank/admin/transactions',
    ADMIN_TX_BY_ID: (id: string) => `/api/bank/admin/transactions/${id}`,
  },
  PORTAL: {
    ME:           '/api/portal/me',
    REWARDS:      '/api/portal/recompensas',
    SOLICITUDES:  '/api/portal/solicitudes',
    SOL_BY_ID:    (id: string) => `/api/portal/solicitudes/${id}`,
    PROFILE:      '/api/portal/profile',
  },
  SOLICITUDES: {
    BASE:    '/api/solicitudes',
    BY_ID:   (id: string) => `/api/solicitudes/${id}`,
  },
  NOTIFICATIONS: {
    BASE:    '/api/notifications',
    BY_ID:   (id: string) => `/api/notifications/${id}`,
    READ:    (id: string) => `/api/notifications/${id}/read`,
    BATCH:   '/api/notifications/batch',
    ADMIN:   (uid: string) => `/api/notifications/admin/users/${uid}`,
  },
  USERS: {
    BASE:  '/api/usuarios',
    BY_ID: (id: string) => `/api/usuarios/${id}`,
  },
  PUSH: {
    VAPID:       '/api/push/vapid-key',
    SUBSCRIBE:   '/api/push/subscribe',
    UNSUBSCRIBE: '/api/push/unsubscribe',
  },
  BACKUP: {
    DOWNLOAD: '/api/backup',
    RESTORE:  '/api/backup/restore',
  },
  GAMES: {
    BASE:           '/api-games/games',
    BY_SLUG:        (slug: string)   => `/api-games/games/${slug}`,
    LEVELS:         (gameId: string) => `/api-games/games/${gameId}/levels`,
    UPDATE:         (id: string)     => `/api-games/games/${id}`,
    UPLOAD_URL:     (id: string)     => `/api-games/games/${id}/upload-url`,
    LEVEL_COMPLETE: '/api-games/sessions/level-complete',
    CONTINUE:       '/api-games/sessions/continue',
  },
} as const
