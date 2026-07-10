import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUsersQuery } from '@/features/users'
import { useTasksQuery } from '@/features/tasks'
import { useAuth } from '@/features/auth/AuthContext'
import { TaskCard } from '@/components/ui/task-card'
import { useProjectsQuery } from '@/features/projects'
import type { TaskStatus } from '@/types/task'
import { TaskFilters } from '@/components/ui/task-filters'

function getDashboardGreetingKey(now: Date): string {
    const hour = now.getHours()
    const day = now.getDay()
    const isWeekend = day === 0 || day === 6

    if (hour >= 5 && hour < 9) {
        return isWeekend ? 'dashboard.greetings.earlyMorningWeekend' : 'dashboard.greetings.earlyMorningWeekday'
    }

    if (hour >= 9 && hour < 12) {
        return 'dashboard.greetings.lateMorning'
    }

    if (hour >= 12 && hour < 17) {
        return 'dashboard.greetings.afternoon'
    }

    if (hour >= 17 && hour < 22) {
        return isWeekend ? 'dashboard.greetings.eveningWeekend' : 'dashboard.greetings.eveningWeekday'
    }

    return 'dashboard.greetings.night'
}

export default function DashboardPage() {
    const { t } = useTranslation()
    const [showDueToday, setShowDueToday] = useState(false)
    const [filter, setFilter] = useState<'All' | TaskStatus>("All")
    const [search, setSearch] = useState("")

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })

    const { data: users = [], isLoading, isError } = useUsersQuery()
    const onlineUsersCount = users.filter(
        (currentUser) => currentUser.status === 'available' || currentUser.status === 'busy'
    ).length
    const { data: listTasks = [], isLoading: isTasksLoading } = useTasksQuery()
    const { data: projects = []} = useProjectsQuery()


    const { user } = useAuth()
    const firstName = user?.name.split(' ')[0] || 'User'
    const greetingKey = getDashboardGreetingKey(new Date())
    const projectNameFor = (id?: number) => projects.find((p) => p.id === id)?.name ?? '—'

    // Filter tasks for current user, and optionally by due date, search, and status
    const today = new Date().toISOString().slice(0, 10)
    const myTasks = listTasks.filter(task => {
        const isMine = task.assignees?.some(assignee => assignee.id === user?.id)
        if (!isMine) return false

        if (showDueToday && task.due_date?.slice(0, 10) !== today) {
            return false
        }

        if (filter !== "All" && task.status !== filter) {
            return false
        }

        return !(search && !task.title.toLowerCase().includes(search.toLowerCase()));
    })

    return (
        <div className="p-10 flex gap-20 w-full bg-zinc-950 min-h-full">
            <div className="flex-[1.8] min-w-0">
                <p className="text-xs text-zinc-500 mb-2">{formattedDate}</p>
                <h2 className="text-3xl font-bold text-white mb-8">{t(greetingKey, { name: firstName })}</h2>

                <div className="flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-sm font-medium text-white flex items-center gap-3">
                            {t('dashboard.myTasks', 'My Tasks')}
                            <span className="text-zinc-500 text-xs font-normal bg-zinc-900 px-2 py-0.5 rounded-full">{t('dashboard.tasksCount', { count: myTasks.length })}</span>
                        </h3>
                    </div>

                    <div className="mb-4">
                        <TaskFilters
                            filter={filter}
                            setFilter={setFilter}
                            search={search}
                            setSearch={setSearch}
                            showDueToday={showDueToday}
                            setShowDueToday={setShowDueToday}
                        />
                    </div>

                    <div className="flex flex-col border-t border-zinc-900 pt-4">
                        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px_130px_100px] gap-4 border-b border-zinc-900 p-3 text-zinc-500 font-medium text-center">
                            <div className="text-left">{t('tasks.columnTask')}</div>
                            <div>{t('tasks.columnProject')}</div>
                            <div>{t('tasks.columnAssigned')}</div>
                            <div>{t('tasks.columnStatus')}</div>
                            <div>{t('tasks.columnDue')}</div>
                        </div>
                        {isTasksLoading ? (
                            <p className="text-xs text-zinc-500 py-4">{t('dashboard.loading')}</p>
                        ) : myTasks.length === 0 ? (
                            <p className="text-xs text-zinc-500 py-4">No tasks assigned to you today.</p>
                        ) : (
                            myTasks.slice(0, 5).map(task => (
                                <TaskCard 
                                    key={task.id}
                                    taskId={task.id}
                                    title={task.title}
                                    projectName={projectNameFor(task.project_id)}
                                    assignees={task.assignees || []}
                                    status={task.status}
                                    dueDate={task.due_date}
                                    statusLabel={t(`tasks.status.${task.status}`)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden xl:block flex-1 max-w-70">
                <h3 className="text-sm font-medium text-zinc-400 mb-5">
                    {t('dashboard.onlineNow')} <span className="text-zinc-500 ml-1">{t('dashboard.peopleCount', { count: onlineUsersCount })}</span>
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
