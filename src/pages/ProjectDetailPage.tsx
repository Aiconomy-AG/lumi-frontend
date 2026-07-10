import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useProjectQuery } from '@/features/projects'
import { useTasksQuery } from '@/features/tasks'
import { TaskCard } from '@/components/ui/task-card'
import { CreateTaskModal } from '@/components/ui/create-task-modal'

export default function ProjectDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const projectId = Number(id)

    const { data: project } = useProjectQuery(projectId)

    const { data: allTasks = [] } = useTasksQuery()

    // backend intoarce toate task-urile → filtram pe proiectul curent si scoatem subtask-urile
    const tasks = allTasks.filter((task) => task.project_id === projectId && task.parent_id == null)

    return (
        <div className="p-10 bg-zinc-950 min-h-screen">
            <Button
                variant="ghost"
                size="sm"
                className="mb-6"
                onClick={() => navigate('/projects')}
            >
                ← {t('projects.title')}
            </Button>

            <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{project?.description}</p>
            {project && (
                <p className="text-xs text-zinc-600 mt-1">
                    {t(`tasks.status.${project.status}`)} · {project.deadline?.slice(0, 10)}
                </p>
            )}

            <div className="mt-8 flex items-center justify-between">
                <h2 className="text-sm font-medium text-zinc-400">{t('projects.tasksTitle')}</h2>
                <CreateTaskModal defaultProjectId={projectId}>
                    <Button>{t('projects.addTask')}</Button>
                </CreateTaskModal>
            </div>

            <div className="mt-4 grid gap-2">
                {tasks.length === 0 && <p className="text-sm text-zinc-600">{t('projects.noTasks')}</p>}
                {tasks.map((task) => (
                    <TaskCard 
                        key={task.id}
                        taskId={task.id}
                        title={task.title}
                        projectName={project?.name || '—'}
                        assignees={task.assignees || []}
                        status={task.status}
                        dueDate={task.due_date}
                        statusLabel={t(`tasks.status.${task.status}`)}
                        className="border border-zinc-800 rounded-lg px-4 bg-zinc-900 border-b-zinc-800"
                    />
                ))}
            </div>
        </div>
    )
}
