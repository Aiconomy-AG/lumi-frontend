import type { PaginatedResponse } from '@/types/order'
import type { ReturnFilters, ReturnRequest } from '@/types/return'
import { request, requestData } from './http'

export async function getReturns(filters: ReturnFilters = {}): Promise<PaginatedResponse<ReturnRequest>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
  )
  return request<PaginatedResponse<ReturnRequest>>('/admin/returns', { params })
}

export async function getReturn(returnId: number): Promise<ReturnRequest> {
  return requestData<ReturnRequest>(`/admin/returns/${returnId}`)
}

export async function updateReturnNotes(returnId: number, notes: string | null): Promise<ReturnRequest> {
  return requestData<ReturnRequest>(`/admin/returns/${returnId}`, {
    method: 'PATCH',
    data: { notes },
  })
}

export async function approveReturn(returnId: number): Promise<ReturnRequest> {
  return requestData<ReturnRequest>(`/admin/returns/${returnId}/approve`, { method: 'POST' })
}

export async function rejectReturn(returnId: number, notes?: string): Promise<ReturnRequest> {
  return requestData<ReturnRequest>(`/admin/returns/${returnId}/reject`, {
    method: 'POST',
    data: notes ? { notes } : {},
  })
}

export async function markReturnReceived(returnId: number): Promise<ReturnRequest> {
  return requestData<ReturnRequest>(`/admin/returns/${returnId}/received`, { method: 'POST' })
}

export async function markReturnRefunded(returnId: number): Promise<ReturnRequest> {
  return requestData<ReturnRequest>(`/admin/returns/${returnId}/refunded`, { method: 'POST' })
}
