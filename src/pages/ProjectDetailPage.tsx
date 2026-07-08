import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { TaskStatus } from '@/types/task'
import { useProjectQuery } from '@/features/projects'
import { useCreateTaskMutation, useTasksQuery } from '@/features/tasks'

const STATUSES: TaskStatus[] = ['to_do', 'in_progress', 'blocked', 'complete']

const statusDotClass: Record<TaskStatus, string> = {
    to_do: 'bg-zinc-500',
    in_progress: 'bg-amber-400',
    blocked: 'bg-rose-400',
    complete: 'bg-emerald-400',
}

export default function ProjectDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const projectId = Number(id)

    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [status, setStatus] = useState<TaskStatus>('to_do')

    const { data: project } = useProjectQuery(projectId)

    const { data: allTasks = [] } = useTasksQuery()

    // backend intoarce toate task-urile → filtram pe proiectul curent
    const tasks = allTasks.filter((task) => task.project_id === projectId)

    const createTaskMutation = useCreateTaskMutation()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        await createTaskMutation.mutateAsync({ title, description, status, due_date: dueDate, project_id: projectId })
        setTitle(''); setDescription(''); setDueDate(''); setStatus('to_do')
        setIsOpen(false)
    }

    return (
        <div className="p-10 bg-zinc-950 min-h-screen">
            <button
                onClick={() => navigate('/projects')}
                className="bg-transparent border-none text-zinc-500 hover:text-zinc-200 text-sm font-medium cursor-pointer mb-6 transition-colors"
            >
                ← {t('projects.title')}
            </button>

            <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{project?.description}</p>
            {project && (
                <p className="text-xs text-zinc-600 mt-1">
                    {t(`tasks.status.${project.status}`)} · {project.deadline?.slice(0, 10)}
                </p>
            )}

            <div className="mt-8 flex items-center justify-between">
                <h2 className="text-sm font-medium text-zinc-400">{t('projects.tasksTitle')}</h2>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition-colors cursor-pointer">
                        {t('projects.addTask')}
                    </DialogTrigger>
                    <DialogContent className="max-w-[440px]">
                        <DialogHeader>
                            <DialogTitle>{t('projects.addTask')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.taskTitle')}</label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.fieldDescription')}</label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.dueDate')}</label>
                                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.fieldStatus')}</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-ring cursor-pointer"
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>{t(`tasks.status.${s}`)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    {t('projects.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createTaskMutation.isPending}
                                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50 cursor-pointer transition-colors"
                                >
                                    {t('projects.save')}
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mt-4 grid gap-2">
                {tasks.length === 0 && <p className="text-sm text-zinc-600">{t('projects.noTasks')}</p>}
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                        <div className="flex items-center gap-3">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotClass[task.status]}`}></span>
                            <span className="text-sm text-zinc-200">{task.title}</span>
                        </div>
                        <span className="text-xs text-zinc-500">{t(`tasks.status.${task.status}`)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
