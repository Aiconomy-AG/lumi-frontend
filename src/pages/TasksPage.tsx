import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskStatus } from '@/types/task'
import { useProjectsQuery } from '@/features/projects'
import { useTasksQuery } from '@/features/tasks'
import { TaskCard } from '@/components/ui/task-card'
import { PaginationFooter } from '@/components/ui/pagination-footer'
import { CreateTaskModal } from '@/components/ui/create-task-modal'
import { TaskFilters } from '@/components/ui/task-filters'
import { Button } from '@/components/ui/button'

export default function TasksPage() {
    const { t } = useTranslation()
    const [filter, setFilter] = useState<'All' | TaskStatus>("All")
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const { data: tasks = [], isLoading: isLoadingTasks } = useTasksQuery()
    const { data: projects = [], isLoading: isLoadingProjects } = useProjectsQuery()
    const [showDueToday, setShowDueToday] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0)
    }, [page, perPage])


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
            <div className="flex items-center justify-between w-full">
                <TaskFilters 
                    filter={filter} 
                    setFilter={(val) => { setFilter(val); setPage(1); }} 
                    search={search} 
                    setSearch={(val) => { setSearch(val); setPage(1); }}
                    showDueToday={showDueToday}
                    setShowDueToday={(val) => { setShowDueToday(val); setPage(1); }}
                />

                <CreateTaskModal>
                    <Button className="ml-auto">{t('tasks.addButton')}</Button>
                </CreateTaskModal>
            </div>

            {isLoading ? (
                <p className="text-sm text-zinc-500">{t('admin.loading')}</p>
            ) : filteredTasks.length === 0 ? (
                <p className="text-sm text-zinc-500">{t('projects.noTasks')}</p>
            ) : (
                <div className="w-full text-sm flex flex-col flex-1 min-h-0">
                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px_130px_100px] gap-4 border-b border-zinc-900 p-3 text-zinc-500 font-medium text-center shrink-0">
                        <div className="text-left">{t('tasks.columnTask')}</div>
                        <div>{t('tasks.columnProject')}</div>
                        <div>{t('tasks.columnAssigned')}</div>
                        <div>{t('tasks.columnStatus')}</div>
                        <div>{t('tasks.columnDue')}</div>
                    </div>
                    <div ref={scrollRef} className="flex flex-col flex-1 overflow-y-auto pr-2">
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
                    </div>
                </div>
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
