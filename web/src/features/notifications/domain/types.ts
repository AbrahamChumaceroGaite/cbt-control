export type Severity = 'positive' | 'negative' | 'info' | 'default'

export interface NotificationItem {
  id:        string
  title:     string
  body:      string
  url:       string
  tag:       string
  isRead:    boolean
  createdAt: string
}

export interface InboxResult {
  items:       NotificationItem[]
  unreadCount: number
}
