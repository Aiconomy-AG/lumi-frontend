import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskStatus } from '@/types/task'
import { useProjectsQuery } from '@/features/projects'
import { useCreateTaskMutation } from '@/features/tasks'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export interface CreateTaskModalProps {
    children: React.ReactNode
    defaultProjectId?: number
}

export function CreateTaskModal({ children, defaultProjectId }: CreateTaskModalProps) {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)

    const { data: projects = [] } = useProjectsQuery()
    const createTaskMutation = useCreateTaskMutation()

    const [title, setTitle] = useState("")
    const [projectId, setProjectId] = useState<string | number>(defaultProjectId || "")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState<TaskStatus>("to_do")
    const [dueDate, setDueDate] = useState("")

    useEffect(() => {
        if (isOpen) {
            setTitle("")
            setProjectId(defaultProjectId || "")
            setDescription("")
            setStatus("to_do")
            setDueDate("")
        }
    }, [isOpen, defaultProjectId])

    const statusLabels: Record<TaskStatus, string> = {
        to_do: t('tasks.status.to_do'),
        in_progress: t('tasks.status.in_progress'),
        blocked: t('tasks.status.blocked'),
        complete: t('tasks.status.complete'),
    }

    async function handleCreateTask(e: React.FormEvent) {
        e.preventDefault()
        if (!projectId) return

        await createTaskMutation.mutateAsync({
            title,
            description,
            status,
            due_date: dueDate,
            project_id: Number(projectId),
        })

        setIsOpen(false)
    }

    const currentProject = projects.find(p => p.id === defaultProjectId)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={children as React.ReactElement} />

            <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-110 rounded-xl p-6 shadow-2xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-base font-bold text-white">{t('tasks.newTaskTitle')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('tasks.fieldTitle')}</label>
                        <input
                            type="text"
                            placeholder={t('tasks.fieldTitlePlaceholder')}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700 transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('tasks.columnProject')}</label>
                        {defaultProjectId ? (
                            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-zinc-500">
                                {currentProject?.name || "Loading..."}
                            </div>
                        ) : (
                            <select
                                value={projectId}
                                onChange={e => setProjectId(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none cursor-pointer focus:border-zinc-700"
                                required
                            >
                                <option value="">—</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('tasks.fieldDescription')}</label>
                        <textarea
                            placeholder={t('tasks.fieldDescriptionPlaceholder')}
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700 transition-colors resize-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('tasks.fieldStatus')}</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as TaskStatus)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none cursor-pointer focus:border-zinc-700"
                        >
                            <option value="to_do">{statusLabels.to_do}</option>
                            <option value="in_progress">{statusLabels.in_progress}</option>
                            <option value="blocked">{statusLabels.blocked}</option>
                            <option value="complete">{statusLabels.complete}</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('tasks.fieldDueDate')}</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-zinc-700 transition-colors dark:scheme-dark"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="bg-transparent text-zinc-400 hover:text-zinc-200 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                            {t('tasks.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={createTaskMutation.isPending || !projectId}
                            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('tasks.add')}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
