import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import type { Project } from '@/types/project'
import type { TaskStatus } from '@/types/task'
import { useAuth } from '@/features/auth/AuthContext'
import { useDeleteProjectMutation, useProjectsQuery, useSaveProjectMutation } from '@/features/projects'
import axios from 'axios'

const STATUSES: TaskStatus[] = ['to_do', 'in_progress', 'blocked', 'complete']

export default function ProjectsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { isAdmin } = useAuth()

    const [isOpen, setIsOpen] = useState(false)
    const [editing, setEditing] = useState<Project | null>(null)
    const [pendingDelete, setPendingDelete] = useState<Project | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState('')
    const [status, setStatus] = useState<TaskStatus>('to_do')

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')

    const { data: projects = [], isLoading } = useProjectsQuery()

    const filteredProjects = projects.filter((project) => {
        if (search && !project.name.toLowerCase().includes(search.toLowerCase())) return false
        if (statusFilter && project.status !== statusFilter) return false
        const deadline = project.deadline?.slice(0, 10) ?? ''
        if (from && (!deadline || deadline < from)) return false
        if (to && (!deadline || deadline > to)) return false
        return true
    })

    const [saveError, setSaveError] = useState<string | null>(null)
    const saveMutation = useSaveProjectMutation()
    const deleteMutation = useDeleteProjectMutation()

    function openAdd() {
        setEditing(null)
        setName(''); setDescription(''); setDeadline(''); setStatus('to_do')
        setIsOpen(true)
    }

    function openEdit(project: Project) {
        setEditing(project)
        setName(project.name)
        setDescription(project.description)
        setDeadline(project.deadline?.slice(0, 10) ?? '')
        setStatus(project.status)
        setIsOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaveError(null)
        try {
            await saveMutation.mutateAsync({ id: editing?.id, payload: { name, description, deadline, status } })
            setIsOpen(false)
        } catch (err) {
            console.error('Save project failed:', err)
            const serverMessage =
                (axios.isAxiosError(err) && (err.response?.data?.message as string | undefined)) || undefined
            setSaveError(serverMessage ?? (err instanceof Error ? err.message : 'Eroare la salvare'))
        }
    }

    async function handleConfirmDelete() {
        if (!pendingDelete) return
        await deleteMutation.mutateAsync(pendingDelete.id)
        setPendingDelete(null)
    }

    return (
        <div className="p-10 bg-zinc-950 min-h-screen">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-bold text-white">{t('projects.title')}</h1>
                {isAdmin && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger
                        onClick={openAdd}
                        render={<Button>{t('projects.addButton')}</Button>}
                    />
                    <DialogContent className="max-w-[440px]">
                        <DialogHeader>
                            <DialogTitle>{editing ? t('projects.editTitle') : t('projects.newTitle')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.fieldName')}</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.fieldDescription')}</label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.fieldDeadline')}</label>
                                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
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
                            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('projects.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                >
                                    {t('projects.save')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
                )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('projects.searchPlaceholder')}
                    className="w-56"
                />
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => setStatusFilter(value === 'all' ? '' : (value as TaskStatus))}
                >
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder={t('projects.filterStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('projects.allStatuses')}</SelectItem>
                        {STATUSES.map((value) => (
                            <SelectItem key={value} value={value}>
                                {t(`tasks.status.${value}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    aria-label={t('projects.from')}
                    className="w-40"
                />
                <Input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    aria-label={t('projects.to')}
                    className="w-40"
                />
            </div>

            {isLoading ? (
                <p className="text-zinc-500">{t('projects.loading')}</p>
            ) : (
                <div className="grid gap-3">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium text-white">{project.name}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{project.description}</p>
                                    <p className="text-xs text-zinc-600 mt-1">
                                        {t(`tasks.status.${project.status}`)} · {project.deadline?.slice(0, 10)}
                                    </p>
                                </div>
                                {isAdmin && (
                                <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <Button size="sm" variant="ghost" onClick={() => openEdit(project)}>
                                        {t('projects.edit')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setPendingDelete(project)}
                                    >
                                        {t('projects.delete')}
                                    </Button>
                                </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredProjects.length === 0 && <p className="text-sm text-zinc-600">{t('projects.empty')}</p>}
                </div>
            )}

            <ConfirmDeleteDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => { if (!open) setPendingDelete(null) }}
                title={t('projects.delete')}
                description={t('projects.deleteConfirm')}
                confirmLabel={t('projects.delete')}
                cancelLabel={t('projects.cancel')}
                onConfirm={handleConfirmDelete}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
