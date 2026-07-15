import { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUsersQuery } from '@/features/users'
import { useTasksQuery } from '@/features/tasks'
import { useAuth } from '@/features/auth/AuthContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TaskCard, avatarColorFor, initialsOf } from '@/components/ui/task-card'
import { PaginationFooter } from '@/components/ui/pagination-footer'
import { useProjectsQuery } from '@/features/projects'
import type { TaskStatus } from '@/types/task'
import { TaskFilters } from '@/components/ui/task-filters'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { formatWorkspaceDate, getDashboardGreetingKey, getWorkspaceDateParts } from '@/lib/workspaceTime'
import { UserProfileDialog } from '@/features/users/components/UserProfileDialog'
import { useProfileDialog } from '@/features/users/useProfileDialog'

export default function DashboardPage() {
    const { t, i18n } = useTranslation()
    const [showDueToday, setShowDueToday] = useState(false)
    const [filter, setFilter] = useState<'All' | TaskStatus>("All")
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [isUsersCollapsed, setIsUsersCollapsed] = useState(false)
    const [showOnlyOnline, setShowOnlyOnline] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0)
    }, [page, perPage])

    const formattedDate = formatWorkspaceDate(new Date(), i18n.language)

    const { data: users = [], isLoading, isError } = useUsersQuery()
    const onlineUsersCount = users.filter(
        (currentUser) => currentUser.status === 'available' || currentUser.status === 'busy'
    ).length
    const profileCandidates = useMemo(() => [users], [users])
    const { profileUser, openProfile, closeProfile } = useProfileDialog(profileCandidates)
    const { data: listTasks = [], isLoading: isTasksLoading } = useTasksQuery()
    const { data: projects = [] } = useProjectsQuery()


    const { user } = useAuth()
    const firstName = user?.name.split(' ')[0] || 'User'
    const greetingKey = getDashboardGreetingKey(new Date())
    const projectNameFor = (id?: number) => projects.find((p) => p.id === id)?.name ?? '—'

    const today = getWorkspaceDateParts().dateKey
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

    const totalTasks = myTasks.length
    const lastPage = Math.ceil(totalTasks / perPage) || 1
    const paginatedTasks = myTasks.slice((page - 1) * perPage, page * perPage)

    return (
        <>
        <div className="p-10 flex gap-5 w-full bg-zinc-950 h-full overflow-hidden">
            <div className="flex-[1.8] min-w-0 flex flex-col h-full">
                <p className="text-xs text-zinc-500 mb-2 shrink-0">{formattedDate}</p>
                <h2 className="text-3xl font-bold text-white mb-8 shrink-0">{t(greetingKey, { name: firstName })}</h2>

                <div className="flex flex-col flex-1 min-h-0 gap-6">
                    <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-sm font-medium text-white flex items-center gap-3">
                            {t('dashboard.myTasks', 'My Tasks')}
                            <span className="text-zinc-500 text-xs font-normal bg-zinc-900 px-2 py-0.5 rounded-full">{t('dashboard.tasksCount', { count: myTasks.length })}</span>
                        </h3>
                    </div>

                    <div>
                        <TaskFilters
                            filter={filter}
                            setFilter={(val) => { setFilter(val); setPage(1); }}
                            search={search}
                            setSearch={(val) => { setSearch(val); setPage(1); }}
                            showDueToday={showDueToday}
                            setShowDueToday={(val) => { setShowDueToday(val); setPage(1); }}
                        />
                    </div>

                    <Table ref={scrollRef} containerClassName="flex-1 min-h-0 pr-2 border rounded-md">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left">{t('tasks.columnTask')}</TableHead>
                                <TableHead className="text-center">{t('tasks.columnProject')}</TableHead>
                                <TableHead className="text-center">{t('tasks.columnAssigned')}</TableHead>
                                <TableHead className="text-center">{t('tasks.columnStatus')}</TableHead>
                                <TableHead className="text-center">{t('tasks.columnDue')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isTasksLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-xs text-zinc-500 py-4">{t('dashboard.loading')}</TableCell>
                                </TableRow>
                            ) : myTasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-xs text-zinc-500 py-4">No tasks assigned to you today.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedTasks.map(task => (
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
                        </TableBody>
                    </Table>
                </div>

                {myTasks.length > 0 && (
                    <PaginationFooter
                        page={page}
                        setPage={setPage}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        lastPage={lastPage}
                        total={totalTasks}
                    />
                )}
            </div>

            <div
                className={`hidden xl:flex flex-col h-full pr-2 transition-all duration-300 border-l border-zinc-900/50 pl-4 ml-4 ${isUsersCollapsed ? 'w-14 items-center' : 'w-64 max-w-70'
                    }`}
            >
                <div className={`flex mb-5 w-full ${isUsersCollapsed ? 'flex-col items-center gap-4' : 'items-center justify-between'}`}>
                    {!isUsersCollapsed && (
                        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2 select-none truncate">
                            {t('dashboard.onlineNow')} <span className="text-zinc-500">{t('dashboard.peopleCount', { count: onlineUsersCount })}</span>
                        </h3>
                    )}
                    <div className={`flex items-center gap-1 ${isUsersCollapsed ? 'flex-col' : ''}`}>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            title={isUsersCollapsed ? "Expand users" : "Collapse users"}
                            onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
                            className="text-zinc-400"
                        >
                            {isUsersCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Show only online users"
                            onClick={() => setShowOnlyOnline(!showOnlyOnline)}
                            className={showOnlyOnline ? "bg-zinc-800 text-white" : "text-zinc-500"}
                        >
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 w-full scrollbar-none">
                    {isLoading && !isUsersCollapsed && <p className="text-xs text-zinc-500">{t('dashboard.loading')}</p>}
                    {isError && !isUsersCollapsed && <p className="text-xs text-red-400">{t('dashboard.errorLoadingUsers')}</p>}

                    <ul className={`flex flex-col gap-5 list-none p-0 m-0 pb-10 w-full ${isUsersCollapsed ? 'items-center' : ''}`}>
                        {users
                            .filter(user => showOnlyOnline ? (user.status === 'available' || user.status === 'busy') : true)
                            .map((user) => {
                                const dotColor =
                                    user.status === 'available' ? 'bg-green-500'
                                        : user.status === 'busy' ? 'bg-rose-500'
                                            : user.status === 'away' ? 'bg-amber-500'
                                                : 'bg-zinc-600'
                                return (
                                    <li key={user.id} className="w-full" title={isUsersCollapsed ? user.name : undefined}>
                                        <button
                                            type="button"
                                            onClick={() => openProfile(user.id)}
                                            aria-label={t('chat.viewProfile', { name: user.name })}
                                            className={`flex w-full items-center rounded-lg text-left transition-colors hover:bg-zinc-900/60 ${isUsersCollapsed ? 'justify-center' : 'gap-3 px-1 py-0.5'}`}
                                        >
                                            <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${user.avatar_url ? 'bg-zinc-800' : avatarColorFor(user.id)}`}>
                                                {user.avatar_url
                                                    ? <img src={user.avatar_url} alt="" loading="lazy" className="h-full w-full rounded-full object-cover" />
                                                    : initialsOf(user.name)}
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${dotColor}`}></div>
                                            </div>
                                            {!isUsersCollapsed && (
                                                <div className="flex flex-col min-w-0">
                                                    <p className="text-xs font-medium text-zinc-200 m-0 truncate">{user.name}</p>
                                                    <p className="text-[11px] text-zinc-500 m-0 truncate">
                                                        {t(`userStatus.${user.status}`)}
                                                    </p>
                                                </div>
                                            )}
                                        </button>
                                    </li>
                                )
                            })}
                    </ul>
                </div>
            </div>
        </div>
        <UserProfileDialog
            user={profileUser}
            open={profileUser !== null}
            onOpenChange={(open) => !open && closeProfile()}
        />
        </>
    )
}
