import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/api/client'
import type { AuditLogFilters } from '@/types/auditLog'
import { auditLogKeys } from './queryKeys'

export function useAuditLogsQuery(filters: AuditLogFilters) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => getAuditLogs(filters),
  })
}
