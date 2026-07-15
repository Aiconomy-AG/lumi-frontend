import { useQuery } from '@tanstack/react-query'
import { getMostWishlistedProducts } from '@/api/client'
import { analyticsKeys } from './queryKeys'

export function useMostWishlistedProductsQuery() {
  return useQuery({
    queryKey: analyticsKeys.mostWishlistedProducts(),
    queryFn: getMostWishlistedProducts,
  })
}
