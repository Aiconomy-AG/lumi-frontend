import type { RecentSearchEntry } from './types'
import { RECENT_SEARCH_KEY, RECENT_SEARCH_LIMIT } from './types'

export function loadRecentSearches(): RecentSearchEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentSearchEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRecentSearch(entry: Omit<RecentSearchEntry, 'timestamp'>): void {
  const next: RecentSearchEntry = { ...entry, timestamp: Date.now() }
  const existing = loadRecentSearches().filter((item) => item.id !== next.id)
  const merged = [next, ...existing].slice(0, RECENT_SEARCH_LIMIT)
  localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(merged))
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCH_KEY)
}
