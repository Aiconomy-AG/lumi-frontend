import { useTranslation } from 'react-i18next'
import type { TaskStatus } from '@/types/task'
import { Input } from '@/components/ui/input'

export interface TaskFiltersProps {
    filter: 'All' | TaskStatus
    setFilter: (filter: 'All' | TaskStatus) => void
    search: string
    setSearch: (search: string) => void
    showDueToday?: boolean
    setShowDueToday?: (val: boolean) => void
}

export function TaskFilters({ filter, setFilter, search, setSearch, showDueToday, setShowDueToday }: TaskFiltersProps) {
    const { t } = useTranslation()

    const statusLabels: Record<TaskStatus, string> = {
        to_do: t('tasks.status.to_do'),
        in_progress: t('tasks.status.in_progress'),
        blocked: t('tasks.status.blocked'),
        complete: t('tasks.status.complete'),
    }

    return (
        <div className="flex items-center gap-6 ">

            <Input
                placeholder={t('tasks.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs h-9 shrink-0"
            />

            <div className="flex items-center gap-2">

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'All' | TaskStatus)}
                    className="h-9 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none focus:border-purple-500 cursor-pointer"
                >
                    <option value="All">{t('tasks.filterAll')}</option>
                    {(["to_do", "in_progress", "blocked", "complete"] as const).map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                </select>
                                {setShowDueToday !== undefined && (
                    <button
                        onClick={() => setShowDueToday(!showDueToday)}
                        className={`h-9 shrink-0 whitespace-nowrap rounded-md border px-3 text-sm font-medium transition-colors cursor-pointer ${showDueToday
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800'
                            }`}
                    >
                        {t('dashboard.dueToday')}
                    </button>
                )}

            </div>

        </div>
    )
}
