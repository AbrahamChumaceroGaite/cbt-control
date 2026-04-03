export interface PushPayload {
  title: string
  body:  string
  icon?: string
  tag?:  string
  url?:  string
}

/** Minimal subscription row needed to send a push notification. */
export interface SubRow {
  endpoint: string
  p256dh:   string
  auth:     string
}

export interface PushSubscriptionEntity extends SubRow {
  id:        string
  userId:    string
  createdAt: Date
}
