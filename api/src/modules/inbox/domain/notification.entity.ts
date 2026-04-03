export interface NotificationPayload {
  title: string
  body:  string
  url?:  string
  tag?:  string
}

export interface NotificationEntity {
  id:        string
  userId:    string
  title:     string
  body:      string
  url:       string
  tag:       string
  isRead:    boolean
  createdAt: Date
}

export interface NotificationDto {
  id:        string
  title:     string
  body:      string
  url:       string
  tag:       string
  isRead:    boolean
  createdAt: string
}

export function toNotificationDto(e: NotificationEntity): NotificationDto {
  return { id: e.id, title: e.title, body: e.body, url: e.url, tag: e.tag, isRead: e.isRead, createdAt: e.createdAt.toISOString() }
}
