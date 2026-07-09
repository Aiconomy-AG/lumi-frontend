import type { AuditLog, AuditLogFilters } from '../types/auditLog'
import type { PaginatedResponse } from '../types/order'
import { request } from './http'

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLog>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
  )
  return request<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params })
}
