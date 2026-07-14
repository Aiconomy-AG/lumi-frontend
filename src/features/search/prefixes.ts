import type { SearchResultType } from './types'

export type ParsedSearchQuery = {
  query: string
  types?: SearchResultType[]
  pagesOnly: boolean
}

const prefixMap: Record<string, SearchResultType | 'page'> = {
  task: 'task',
  proj: 'project',
  project: 'project',
  prod: 'product',
  product: 'product',
  ord: 'order',
  order: 'order',
  ret: 'return',
  return: 'return',
  user: 'user',
  page: 'page',
}

export function parseSearchQuery(input: string): ParsedSearchQuery {
  const trimmed = input.trim()
  const match = trimmed.match(/^([a-z]+):\s*(.*)$/i)

  if (!match) {
    return { query: trimmed, pagesOnly: false }
  }

  const prefix = match[1].toLowerCase()
  const query = match[2].trim()
  const mapped = prefixMap[prefix]

  if (!mapped) {
    return { query: trimmed, pagesOnly: false }
  }

  if (mapped === 'page') {
    return { query, pagesOnly: true }
  }

  return { query, types: [mapped], pagesOnly: false }
}

export const searchPrefixHints = [
  'task:',
  'proj:',
  'prod:',
  'ord:',
  'ret:',
  'user:',
  'page:',
] as const
