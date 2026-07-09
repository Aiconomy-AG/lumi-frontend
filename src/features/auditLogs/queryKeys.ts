import type { AuditLogFilters } from '@/types/auditLog'

export const auditLogKeys = {
  all: ['auditLogs'] as const,
  list: (filters: AuditLogFilters) => [...auditLogKeys.all, 'list', filters] as const,
}
