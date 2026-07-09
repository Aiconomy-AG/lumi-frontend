import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskStatus } from '@/types/task'
import { useProjectsQuery } from '@/features/projects'
import { useTasksQuery } from '@/features/tasks'
import { TaskCard } from '@/components/ui/task-card'
import { CreateTaskModal } from '@/components/ui/create-task-modal'
import { TaskFilters } from '@/components/ui/task-filters'

export default function TasksPage() {
    const { t } = useTranslation()
    const [filter, setFilter] = useState<'All' | TaskStatus>("All")
    const [search, setSearch] = useState("")
    const { data: tasks = [], isLoading: isLoadingTasks } = useTasksQuery()
    const { data: projects = [], isLoading: isLoadingProjects } = useProjectsQuery()
    const [showDueToday, setShowDueToday] = useState(false)


    const statusLabels: Record<TaskStatus, string> = {
        to_do: t('tasks.status.to_do'),
        in_progress: t('tasks.status.in_progress'),
        blocked: t('tasks.status.blocked'),
        complete: t('tasks.status.complete'),
    }

    const today = new Date().toISOString().slice(0, 10)
    const filteredTasks = tasks.filter(task => {
        if (filter !== "All" && task.status !== filter) return false
        if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false
        return !(showDueToday && task.due_date?.slice(0, 10) !== today);

    })

    const isLoading = isLoadingTasks || isLoadingProjects

    return (
        <div className="p-10 flex flex-col gap-6 w-full bg-zinc-950">
            <div className="flex items-center justify-between w-full">
                <TaskFilters 
                    filter={filter} 
                    setFilter={setFilter} 
                    search={search} 
                    setSearch={setSearch}
                    showDueToday={showDueToday}
                    setShowDueToday={setShowDueToday}
                />

                <CreateTaskModal>
                    <button className="btn ml-auto">
                        {t('tasks.addButton')}
                    </button>
                </CreateTaskModal>
            </div>

            {isLoading ? (
                <p className="text-sm text-zinc-500">{t('admin.loading')}</p>
            ) : filteredTasks.length === 0 ? (
                <p className="text-sm text-zinc-500">{t('projects.noTasks')}</p>
            ) : (
                <div className="w-full text-sm">
                    <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr] gap-4 border-b border-zinc-900 p-3 text-zinc-500 font-medium">
                        <div>{t('tasks.columnTask')}</div>
                        <div>{t('tasks.columnProject')}</div>
                        <div>{t('tasks.columnAssigned')}</div>
                        <div>{t('tasks.columnStatus')}</div>
                        <div>{t('tasks.columnDue')}</div>
                    </div>
                    <div className="flex flex-col">
                        {filteredTasks.map((task) => (
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
        </div>
    )
}
