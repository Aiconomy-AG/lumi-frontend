export interface AuditLogChanges {
  old?: Record<string, unknown>
  new?: Record<string, unknown>
}

export interface AuditLog {
  id: number
  module: string
  action: string
  entity_type: string
  entity_id: number
  entity_label: string | null
  actor_user_id: number | null
  actor_name: string
  description: string | null
  changes: AuditLogChanges | null
  occurred_at: string
}

export interface AuditLogFilters {
  page?: number
  module?: string
  action?: string
  entity_type?: string
  entity_id?: number
  actor_user_id?: number
  from?: string
  to?: string
  per_page?: number
}
