import type { Order, OrderFilters, PaginatedResponse } from '@/types/order'
import { request, requestData } from './http'

export async function getOrders(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
  )
  return request<PaginatedResponse<Order>>('/admin/orders', { params })
}

export async function getOrder(orderId: number): Promise<Order> {
  return requestData<Order>(`/admin/orders/${orderId}`)
}
