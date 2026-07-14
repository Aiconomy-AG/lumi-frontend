import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TaskStatus } from '@/types/task'
import { useProjectsQuery } from '@/features/projects'
import { useTasksQuery } from '@/features/tasks'
import { TaskCard } from '@/components/ui/task-card'
import { PaginationFooter } from '@/components/ui/pagination-footer'
import { CreateTaskModal } from '@/components/ui/create-task-modal'
import { TaskFilters } from '@/components/ui/task-filters'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TasksPage() {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const [filter, setFilter] = useState<'All' | TaskStatus>("All")
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [createOpen, setCreateOpen] = useState(false)
    const { data: tasks = [], isLoading: isLoadingTasks } = useTasksQuery()
    const { data: projects = [], isLoading: isLoadingProjects } = useProjectsQuery()
    const [showDueToday, setShowDueToday] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0)
    }, [page, perPage])

    useEffect(() => {
        const state = location.state as { openCreate?: boolean } | null
        if (state?.openCreate) {
            setCreateOpen(true)
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])


    const statusLabels: Record<TaskStatus, string> = {
        to_do: t('tasks.status.to_do'),
        in_progress: t('tasks.status.in_progress'),
        blocked: t('tasks.status.blocked'),
        complete: t('tasks.status.complete'),
    }

    const today = new Date().toISOString().slice(0, 10)
    const filteredTasks = tasks.filter(task => {
        if (task.parent_id != null) return false;
        if (filter !== "All" && task.status !== filter) return false
        if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false
        return !(showDueToday && task.due_date?.slice(0, 10) !== today);
    })

    const isLoading = isLoadingTasks || isLoadingProjects

    const total = filteredTasks.length
    const last_page = Math.ceil(total / perPage) || 1
    const meta = { current_page: page, last_page, total }
    const paginatedTasks = filteredTasks.slice((page - 1) * perPage, page * perPage)

    return (
        <div className="p-10 flex flex-col gap-6 w-full bg-zinc-950 h-full overflow-hidden">
            <div className="flex items-start justify-between w-full">
                <TaskFilters
                    filter={filter}
                    setFilter={(val) => { setFilter(val); setPage(1); }}
                    search={search}
                    setSearch={(val) => { setSearch(val); setPage(1); }}
                    showDueToday={showDueToday}
                    setShowDueToday={(val) => { setShowDueToday(val); setPage(1); }}
                />
                <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen}>
                    <Button className="h-9">{t('tasks.addButton')}</Button>
                </CreateTaskModal>
            </div>

            {isLoading ? (
                <p className="text-sm text-zinc-500">{t('admin.loading')}</p>
            ) : filteredTasks.length === 0 ? (
                <p className="text-sm text-zinc-500">{t('projects.noTasks')}</p>
            ) : (
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
                        {paginatedTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                taskId={task.id}
                                title={task.title}
                                projectName={projects.find((p) => p.id === task.project_id)?.name ?? '—'}
                                assignees={task.assignees}
                                status={task.status}
                                dueDate={task.due_date}
                                statusLabel={statusLabels[task.status]}
                            />
                        ))}
                    </TableBody>
                </Table>
            )}

            {filteredTasks.length > 0 && (
                <PaginationFooter
                    page={page}
                    setPage={setPage}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    lastPage={meta.last_page}
                    total={meta.total ?? 0}
                />
            )}
        </div>
    )
}
