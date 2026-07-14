import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { History, X } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { useAuth } from '@/features/auth/AuthContext'
import { useTimeTracking } from '@/hooks/useTimeTracking'
import { useTasksQuery } from '@/features/tasks'
import { matchesSearchQuery } from '@/features/chat/utils'
import { getVisibleNavItems } from '@/lib/navigation'
import { filterActions, getTimerActions, searchActions } from '../actions'
import { useGlobalSearchQuery } from '../hooks'
import { parseSearchQuery, searchPrefixHints } from '../prefixes'
import { loadRecentSearches, saveRecentSearch } from '../recent'
import type { RecentSearchEntry, SearchAction, SearchActionContext, SearchResult } from '../types'
import {
  groupResultsByType,
  pagesActionsColor,
  pagesActionsIcon,
  resultTypeColors,
  resultTypeIcons,
  resultTypeLabelKeys,
  resultTypeOrder,
} from '../utils'
import { SearchSection } from './SearchSection'

type GlobalSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAdmin, updateStatus } = useAuth()
  const { start } = useTimeTracking()
  const { data: tasks = [] } = useTasksQuery()
  const [query, setQuery] = useState('')
  const [includeCompleted, setIncludeCompleted] = useState(false)
  const [recent, setRecent] = useState<RecentSearchEntry[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const parsed = useMemo(() => parseSearchQuery(query), [query])
  const isStaff = user?.role !== 'client'
  const userParam = parsed.query
  const hasActiveSearch = userParam.trim().length >= 2

  const { data, isFetching, isError, isFetched } = useGlobalSearchQuery(userParam, {
    types: parsed.types,
    includeCompleted,
    enabled: open && !parsed.pagesOnly,
  })

  const apiResults = hasActiveSearch && data?.query === userParam ? data.results : []

  useEffect(() => {
    if (!open) {
      setQuery('')
      setIncludeCompleted(false)
      return
    }

    setRecent(loadRecentSearches())
    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const actionContext = useMemo<SearchActionContext>(() => ({
    navigate: (path: string, options?: { state?: Record<string, unknown> }) => navigate(path, options),
    isAdmin,
    isStaff,
    startTimer: start,
    updateStatus,
    tasks: tasks
      .filter((task) => task.parent_id == null)
      .map((task) => ({ id: task.id, title: task.title })),
  }), [navigate, isAdmin, isStaff, start, updateStatus, tasks])

  const closeAndNavigate = useCallback((path: string, state?: Record<string, unknown>) => {
    onOpenChange(false)
    navigate(path, state ? { state } : undefined)
  }, [navigate, onOpenChange])

  const handleNavSelect = useCallback((path: string, label: string) => {
    saveRecentSearch({ id: `nav:${path}`, kind: 'nav', label, url: path })
    closeAndNavigate(path)
  }, [closeAndNavigate])

  const handleActionSelect = useCallback((action: SearchAction) => {
    const label = String(t(action.labelKey, action.labelValues))
    saveRecentSearch({ id: action.id, kind: 'action', label })
    onOpenChange(false)
    action.run(actionContext)
  }, [actionContext, onOpenChange, t])

  const handleResultSelect = useCallback((result: SearchResult) => {
    saveRecentSearch({
      id: `result:${result.type}:${result.id}`,
      kind: 'result',
      label: result.title,
      url: result.url,
    })
    closeAndNavigate(result.url)
  }, [closeAndNavigate])

  const handleRecentSelect = useCallback((entry: RecentSearchEntry) => {
    onOpenChange(false)
    if (entry.kind === 'query') {
      setQuery(entry.label)
      return
    }
    if (entry.url) {
      navigate(entry.url, entry.state ? { state: entry.state } : undefined)
    }
  }, [navigate, onOpenChange])

  const navItems = useMemo(
    () => getVisibleNavItems(isAdmin, user?.role),
    [isAdmin, user?.role],
  )

  const filteredNavItems = useMemo(() => {
    const normalized = parsed.query.trim().toLowerCase()
    if (!normalized) return navItems

    return navItems.filter((item) => {
      const label = t(item.titleKey)
      const group = t(item.groupKey)
      return matchesSearchQuery(label, normalized) || matchesSearchQuery(group, normalized)
    })
  }, [navItems, parsed.query, t])

  const allActions = useMemo(
    () => [...searchActions, ...getTimerActions(actionContext.tasks)],
    [actionContext.tasks],
  )

  const filteredActions = useMemo(
    () => filterActions(allActions, parsed.query, actionContext, matchesSearchQuery, t),
    [allActions, parsed.query, actionContext, t],
  )

  const groupedResults = useMemo(
    () => groupResultsByType(apiResults),
    [apiResults],
  )

  const pagesAndActionsItems = useMemo(() => {
    const items: Array<{
      id: string
      value: string
      title: string
      subtitle?: string | null
      icon?: SearchAction['icon']
      onSelect: () => void
    }> = []

    if (parsed.query.trim().length === 0 && recent.length > 0) {
      for (const entry of recent) {
        items.push({
          id: entry.id,
          value: `recent-${entry.id}-${entry.label}`,
          title: entry.label,
          icon: History,
          onSelect: () => handleRecentSelect(entry),
        })
      }
    }

    for (const action of filteredActions) {
      items.push({
        id: action.id,
        value: `action-${action.id}-${t(action.labelKey, action.labelValues)}`,
        title: String(t(action.labelKey, action.labelValues)),
        icon: action.icon,
        onSelect: () => handleActionSelect(action),
      })
    }

    for (const item of filteredNavItems) {
      items.push({
        id: item.id,
        value: `nav-${item.path}-${t(item.titleKey)}`,
        title: t(item.titleKey),
        subtitle: t(item.groupKey),
        icon: item.icon,
        onSelect: () => handleNavSelect(item.path, t(item.titleKey)),
      })
    }

    return items
  }, [
    filteredActions,
    filteredNavItems,
    handleActionSelect,
    handleNavSelect,
    handleRecentSelect,
    parsed.query,
    recent,
    t,
  ])

  const apiSectionCount = hasActiveSearch ? groupedResults.length : 0
  const summarySectionCount = apiSectionCount + (pagesAndActionsItems.length > 0 ? 1 : 0)
  const summaryTotal = (hasActiveSearch ? apiResults.length : 0) + pagesAndActionsItems.length

  const showHint = userParam.trim().length > 0 && !hasActiveSearch
  const showApiLoading = hasActiveSearch && !parsed.pagesOnly && isFetching
  const showNoResults =
    hasActiveSearch &&
    !parsed.pagesOnly &&
    !showApiLoading &&
    isFetched &&
    !isError &&
    pagesAndActionsItems.length === 0 &&
    groupedResults.length === 0

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
      showCloseButton={false}
      initialFocusRef={searchInputRef}
      title={t('search.title')}
      description={t('search.description')}
      className="max-h-[90vh] w-[min(96vw,72rem)] border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-5xl"
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-4 py-3">
        <h2 className="shrink-0 text-sm font-semibold text-white">{t('search.title')}</h2>
        <div className="flex min-w-0 items-center gap-3">
          <label className="flex shrink-0 items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={includeCompleted}
              onChange={(event) => setIncludeCompleted(event.target.checked)}
              onClick={(event) => event.stopPropagation()}
              className="rounded border-zinc-700 bg-zinc-900"
            />
            <span className="whitespace-nowrap">{t('search.showCompleted')}</span>
          </label>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={t('search.close')}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <CommandInput
        ref={searchInputRef}
        value={query}
        onValueChange={setQuery}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
        autoFocus
      />

      <div className="border-b border-zinc-800 px-4 py-2 text-xs text-zinc-500">
        {t('search.prefixHint', { prefixes: searchPrefixHints.join('  ') })}
      </div>

      {hasActiveSearch && summarySectionCount > 0 && (
        <div className="border-b border-zinc-800 px-4 py-2 text-xs text-zinc-400">
          {t('search.summary', { total: summaryTotal, sections: summarySectionCount })}
        </div>
      )}

      <CommandList className="max-h-[min(70vh,560px)]">
        {showHint && (
          <div className="px-4 py-6 text-center text-sm text-zinc-500">
            {t('search.minChars')}
          </div>
        )}

        {showNoResults && <CommandEmpty>{t('search.noResults', { query: userParam })}</CommandEmpty>}

        {hasActiveSearch && isError && (
          <div className="px-4 py-6 text-center text-sm text-red-400">
            {t('search.error')}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {(pagesAndActionsItems.length > 0 || !hasActiveSearch) && (
            <SearchSection
              title={t('search.sections.pagesActions')}
              count={pagesAndActionsItems.length}
              colorClass={pagesActionsColor}
              icon={pagesActionsIcon}
              items={pagesAndActionsItems}
            />
          )}

          {!parsed.pagesOnly && hasActiveSearch && groupedResults.map((group) => {
            const Icon = resultTypeIcons[group.type]
            return (
              <SearchSection
                key={group.type}
                title={t(resultTypeLabelKeys[group.type])}
                count={group.items.length}
                colorClass={resultTypeColors[group.type]}
                icon={Icon}
                items={group.items.map((result) => ({
                  id: `${result.type}-${result.id}`,
                  value: `${result.type}-${result.id}-${result.title}-${result.subtitle ?? ''}`,
                  title: result.title,
                  subtitle: result.subtitle,
                  icon: Icon,
                  onSelect: () => handleResultSelect(result),
                }))}
              />
            )
          })}

          {!parsed.pagesOnly && showApiLoading && groupedResults.length === 0 && (
            resultTypeOrder.slice(0, 3).map((type) => {
              const Icon = resultTypeIcons[type]
              return (
                <SearchSection
                  key={type}
                  title={t(resultTypeLabelKeys[type])}
                  count={0}
                  colorClass={resultTypeColors[type]}
                  icon={Icon}
                  items={[]}
                  loading
                />
              )
            })
          )}
        </div>
      </CommandList>

      <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">
        <span>{t('search.footerNavigate')}</span>
        <CommandShortcut>{t('search.shortcut')}</CommandShortcut>
      </div>
    </CommandDialog>
  )
}
