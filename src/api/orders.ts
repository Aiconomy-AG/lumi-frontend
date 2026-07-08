import type { Order, PaginatedResponse } from '@/types/order'
import { request } from './http'

export async function getOrders(page = 1): Promise<PaginatedResponse<Order>> {
  return request<PaginatedResponse<Order>>(`/v1/admin/orders?page=${page}`)
}
