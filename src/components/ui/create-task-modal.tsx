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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

            <DialogContent className="max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>{t('tasks.newTaskTitle')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateTask} className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">{t('tasks.fieldTitle')}</label>
                        <Input
                            placeholder={t('tasks.fieldTitlePlaceholder')}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">{t('tasks.columnProject')}</label>
                        {defaultProjectId ? (
                            <div className="h-9 rounded-md border border-input bg-transparent px-3 flex items-center text-sm text-muted-foreground">
                                {currentProject?.name || "Loading..."}
                            </div>
                        ) : (
                            <select
                                value={projectId}
                                onChange={e => setProjectId(e.target.value)}
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-ring cursor-pointer"
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
                        <label className="text-xs font-medium text-muted-foreground">{t('tasks.fieldDescription')}</label>
                        <textarea
                            placeholder={t('tasks.fieldDescriptionPlaceholder')}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground outline-none focus:border-ring resize-none h-48 overflow-y-auto"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">{t('tasks.fieldStatus')}</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as TaskStatus)}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-ring cursor-pointer"
                        >
                            <option value="to_do">{statusLabels.to_do}</option>
                            <option value="in_progress">{statusLabels.in_progress}</option>
                            <option value="blocked">{statusLabels.blocked}</option>
                            <option value="complete">{statusLabels.complete}</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">{t('tasks.fieldDueDate')}</label>
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('tasks.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={createTaskMutation.isPending || !projectId}
                        >
                            {t('tasks.add')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
