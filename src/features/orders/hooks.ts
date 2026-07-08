import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/client'
import { orderKeys } from './queryKeys'

export function useOrdersQuery(page: number) {
  return useQuery({
    queryKey: orderKeys.list(page),
    queryFn: () => getOrders(page),
  })
}
