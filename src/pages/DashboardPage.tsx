import { useTranslation } from 'react-i18next'
import { useUsersQuery } from '@/features/users'
import { useTasksQuery } from '@/features/tasks'
import { useAuth } from '@/features/auth/AuthContext'
import { TaskCard } from '@/components/ui/task-card'

export default function DashboardPage() {
    const { t } = useTranslation()
    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })

    const { data: users = [], isLoading, isError } = useUsersQuery()
    // #TODO:  instead of mockTasks use the real tasks when the endpoint is ready
    const { data: mockTasks = [], isLoading: isTasksLoading } = useTasksQuery()

    const { user } = useAuth()
    const firstName = user?.name.split(' ')[0] || 'User'


    return (
        <div className="p-10 flex gap-20 w-full bg-zinc-950 min-h-full">
            <div className="flex-[1.8]">
                <p className="text-xs text-zinc-500 mb-2">{formattedDate}</p>
                <h2 className="text-3xl font-bold text-white mb-8">{t('dashboard.greeting', { name: firstName })}</h2>

                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white">
                            {t('dashboard.dueToday')} <span className="text-zinc-500 ml-1">{t('dashboard.tasksCount', { count: mockTasks.length })}</span>
                        </h3>
                    </div>

                    <div className="flex flex-col border-t border-zinc-900">
                        {isTasksLoading ? (
                            <p className="text-xs text-zinc-500 py-4">{t('dashboard.loading')}</p>
                        ) : (
                            mockTasks.slice(0, 5).map(task => (
                                <TaskCard 
                                    key={task.id}
                                    title={task.title}
                                    subtitle={task.assignees?.map(a => a.name).join(', ') || 'Unassigned'}
                                    statusLabel={t(`tasks.status.${task.status}`)}
                                    statusVariant={task.status === 'in_progress' ? 'in-progress' : task.status === 'to_do' ? 'todo' : 'done'}
                                    dotColorClass={task.status === 'complete' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-amber-500' : 'bg-red-500'}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-70">
                <h3 className="text-sm font-medium text-zinc-400 mb-5">
                    {t('dashboard.onlineNow')} <span className="text-zinc-500 ml-1">{t('dashboard.peopleCount', { count: users.length })}</span>
                </h3>

                {isLoading && <p className="text-xs text-zinc-500">{t('dashboard.loading')}</p>}
                {isError && <p className="text-xs text-red-400">{t('dashboard.errorLoadingUsers')}</p>}

                <ul className="flex flex-col gap-5 list-none p-0 m-0">
                    {users.map((user) => {
                        const dotColor =
                            user.status === 'available' ? 'bg-green-500'
                            : user.status === 'busy' ? 'bg-rose-500'
                            : user.status === 'away' ? 'bg-amber-500'
                            : 'bg-zinc-600'
                        return (
                            <li key={user.id} className="flex items-center gap-3">
                                <div className="relative w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
                                    {user.name.substring(0, 2).toUpperCase()}
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${dotColor}`}></div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xs font-medium text-zinc-200 m-0">{user.name}</p>
                                    <p className="text-[11px] text-zinc-500 m-0">
                                        {t(`userStatus.${user.status}`)}
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
