import type { LucideIcon } from 'lucide-react'

export type SearchResultType =
  | 'task'
  | 'project'
  | 'product'
  | 'order'
  | 'return'
  | 'user'

export type SearchResult = {
  type: SearchResultType
  module: string
  id: number
  title: string
  subtitle?: string | null
  url: string
  meta?: Record<string, unknown>
}

export type GlobalSearchResponse = {
  query: string
  results: SearchResult[]
  meta: {
    total: number
    per_type: Record<string, number>
  }
}

export type NavSearchItem = {
  id: string
  titleKey: string
  path: string
  icon: LucideIcon
  groupKey: string
}

export type SearchActionContext = {
  navigate: (path: string, options?: { state?: Record<string, unknown> }) => void
  isAdmin: boolean
  isStaff: boolean
  startTimer: (taskId: number) => Promise<void>
  updateStatus: (status: 'available' | 'busy' | 'away') => Promise<void>
  tasks: Array<{ id: number; title: string }>
}

export type SearchAction = {
  id: string
  labelKey: string
  labelValues?: Record<string, string>
  keywords?: string[]
  icon: LucideIcon
  available?: (ctx: SearchActionContext) => boolean
  run: (ctx: SearchActionContext) => void
}

export type RecentSearchEntry = {
  id: string
  kind: 'query' | 'result' | 'nav' | 'action'
  label: string
  url?: string
  state?: Record<string, unknown>
  timestamp: number
}

export const RECENT_SEARCH_KEY = 'lumi:search:recent'
export const RECENT_SEARCH_LIMIT = 5
