import { requestData } from './http'
import type { GlobalSearchResponse } from '@/features/search/types'

type GlobalSearchOptions = {
  types?: string[]
  includeCompleted?: boolean
  limit?: number
}

export async function globalSearch(q: string, opts: GlobalSearchOptions = {}) {
  return requestData<GlobalSearchResponse>('/search', {
    params: {
      q,
      ...(opts.types && opts.types.length > 0 ? { types: opts.types } : {}),
      ...(opts.includeCompleted ? { include_completed: 1 } : {}),
      limit: opts.limit ?? 5,
    },
  })
}
