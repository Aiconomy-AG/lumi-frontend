import type { ReturnFilters } from '@/types/return'

export const returnKeys = {
  all: ['returns'] as const,
  lists: () => [...returnKeys.all, 'list'] as const,
  list: (filters: ReturnFilters) => [...returnKeys.lists(), filters] as const,
  details: () => [...returnKeys.all, 'detail'] as const,
  detail: (id: number) => [...returnKeys.details(), id] as const,
}
