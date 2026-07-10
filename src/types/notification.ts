export interface NotificationEventPayload {
  field?: string
  old_value?: string | number | boolean | null
  new_value?: string | number | boolean | null
  task_title?: string
  project_title?: string
  project_name?: string
  conversation_name?: string
  conversation_type?: string
  message_preview?: string
  [key: string]: unknown
}

export interface NotificationEvent {
  id: number
  actor_user_id: number | null
  type: string
  source: string
  task_id?: number | null
  project_id?: number | null
  conversation_id?: number | null
  message_id?: number | null
  payload?: NotificationEventPayload | null
  created_at?: string | null
  updated_at?: string | null
}

export interface NotificationDelivery {
  id: number
  notification_event_id: number
  recipient_user_id: number
  title?: string | null
  body?: string | null
  read_at?: string | null
  seen_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  event: NotificationEvent
}
