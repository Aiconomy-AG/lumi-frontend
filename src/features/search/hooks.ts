import { globalSearch } from '@/api/search'
import { useQuery } from '@tanstack/react-query'
import { searchKeys } from './queryKeys'

type UseGlobalSearchOptions = {
  types?: string[]
  includeCompleted?: boolean
  enabled?: boolean
}

export function useGlobalSearchQuery(query: string, options: UseGlobalSearchOptions = {}) {
  const normalized = query.trim()
  const { types, includeCompleted = false, enabled = true } = options

  return useQuery({
    queryKey: searchKeys.query(normalized, types, includeCompleted),
    queryFn: () => globalSearch(normalized, { types, includeCompleted }),
    enabled: enabled && normalized.length >= 2,
    staleTime: 30_000,
  })
}
