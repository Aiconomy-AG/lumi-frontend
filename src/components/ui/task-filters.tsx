import { useTranslation } from 'react-i18next'
import type { TaskStatus } from '@/types/task'

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
        <div className="flex items-center gap-6">
            <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-850">
                {(["All", "to_do", "in_progress", "blocked", "complete"] as const).map((btn) => (
                    <button
                        key={btn}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer border-none ${
                            filter === btn
                                ? "bg-purple-600 text-white"
                                : "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                        onClick={() => setFilter(btn)}
                    >
                        {btn === "All" ? t('tasks.filterAll') : statusLabels[btn]}
                    </button>
                ))}
            </div>

            {setShowDueToday !== undefined && (
                <button
                    onClick={() => setShowDueToday(!showDueToday)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                        showDueToday 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'
                    }`}
                >
                    {t('dashboard.dueToday')}
                </button>
            )}

            <div className="bg-transparent">
                <input
                    type="text"
                    placeholder={t('tasks.searchPlaceholder')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-zinc-900 border border-zinc-850 rounded-lg px-4 py-1.5 text-zinc-300 placeholder-zinc-600 text-xs outline-none w-[240px] focus:border-purple-500/50 transition-colors"
                />
            </div>
        </div>
    )
}
