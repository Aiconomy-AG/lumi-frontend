import { useQuery } from '@tanstack/react-query'
import { getOrder, getOrders } from '@/api/client'
import type { OrderFilters } from '@/types/order'
import { orderKeys } from './queryKeys'

export function useOrdersQuery(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => getOrders(filters),
    placeholderData: (previous) => previous,
  })
}

export function useOrderQuery(orderId: number) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId),
    enabled: Number.isFinite(orderId) && orderId > 0,
  })
}
