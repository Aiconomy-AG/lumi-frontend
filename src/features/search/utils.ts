import type { SearchResultType } from './types'
import {
  CheckSquare,
  ClipboardList,
  FolderKanban,
  LayoutGrid,
  ShoppingCart,
  Undo2,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const resultTypeIcons: Record<SearchResultType, LucideIcon> = {
  task: CheckSquare,
  project: FolderKanban,
  product: ShoppingCart,
  order: ClipboardList,
  return: Undo2,
  user: Users,
}

export const resultTypeLabelKeys: Record<SearchResultType, string> = {
  task: 'search.sections.tasks',
  project: 'search.sections.projects',
  product: 'search.sections.products',
  order: 'search.sections.orders',
  return: 'search.sections.returns',
  user: 'search.sections.users',
}

export const resultTypeColors: Record<SearchResultType, string> = {
  task: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  project: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
  product: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  order: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  return: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  user: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
}

export const pagesActionsIcon = LayoutGrid
export const pagesActionsColor = 'text-purple-400 border-purple-500/30 bg-purple-500/10'

export const resultTypeOrder: SearchResultType[] = [
  'product',
  'task',
  'project',
  'order',
  'return',
  'user',
]

export function groupResultsByType<T extends { type: SearchResultType }>(results: T[]) {
  const groups = new Map<SearchResultType, T[]>()

  for (const type of resultTypeOrder) {
    groups.set(type, [])
  }

  for (const result of results) {
    const bucket = groups.get(result.type) ?? []
    bucket.push(result)
    groups.set(result.type, bucket)
  }

  return resultTypeOrder
    .map((type) => ({ type, items: groups.get(type) ?? [] }))
    .filter((group) => group.items.length > 0)
}
