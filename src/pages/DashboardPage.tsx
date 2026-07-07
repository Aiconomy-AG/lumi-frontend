import { useTranslation } from 'react-i18next'
import { getUsers } from '../api/client'
import {useQuery} from '@tanstack/react-query'
export default function DashboardPage() {
    const { t } = useTranslation()
    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })

    const { data: users = [], isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
    })

    return (
        <div className="p-10 flex gap-20 w-full bg-zinc-950 min-h-full">
            <div className="flex-[1.8]">
                <p className="text-xs text-zinc-500 mb-2">{formattedDate}</p>
                <h2 className="text-3xl font-bold text-white mb-8">{t('dashboard.greeting', { name: 'Ana' })}</h2>

                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white">
                            {t('dashboard.dueToday')} <span className="text-zinc-500 ml-1">{t('dashboard.tasksCount', { count: 3 })}</span>
                        </h3>
                    </div>

                    <div className="flex flex-col border-t border-zinc-900">
                        <div className="flex items-center justify-between py-4 border-b border-zinc-900">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">Implement authentication module</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Backend • AP RP</p>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-medium">
                                {t('tasks.status.in_progress')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-4 border-b border-zinc-900">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">Dashboard redesign</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Frontend • MI</p>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded bg-zinc-900 text-zinc-400 font-medium">
                                {t('tasks.status.pending')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-[280px]">
                <h3 className="text-sm font-medium text-zinc-400 mb-5">
                    {t('dashboard.onlineNow')} <span className="text-zinc-500 ml-1">{t('dashboard.peopleCount', { count: users.length })}</span>
                </h3>

                {isLoading && <p className="text-xs text-zinc-500">{t('dashboard.loading')}</p>}
                {isError && <p className="text-xs text-red-400">{t('dashboard.errorLoadingUsers')}</p>}

                <ul className="flex flex-col gap-5 list-none p-0 m-0">
                    {users.map((user) => {
                        const isOffline = user.status === 'inactive'
                        return (
                            <li key={user.id} className="flex items-center gap-3">
                                <div className="relative w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
                                    {user.name.substring(0, 2).toUpperCase()}
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${
                                        isOffline ? 'bg-zinc-600' : 'bg-green-500'
                                    }`}></div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xs font-medium text-zinc-200 m-0">{user.name}</p>
                                    <p className="text-[11px] text-zinc-500 m-0">
                                        {isOffline ? t('dashboard.offline') : t('dashboard.active')}
                                    </p>
                                </div>
                            </li>
                        )
                    }
                    )}
                </ul>
            </div>
        </div>
    )
}
