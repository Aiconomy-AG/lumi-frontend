import type { ProductFilters } from '@/types/product'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  categories: () => ['shopify-categories'] as const,
}
