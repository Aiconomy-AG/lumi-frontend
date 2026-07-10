import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PaginationFooter } from '@/components/ui/pagination-footer'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import type { Project } from '@/types/project'
import type { TaskStatus } from '@/types/task'
import { useAuth } from '@/features/auth/AuthContext'
import { useDeleteProjectMutation, useProjectsQuery, useSaveProjectMutation } from '@/features/projects'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { statusBadgeClass, statusDotClass } from '@/components/ui/task-card'

const STATUSES: TaskStatus[] = ['to_do', 'in_progress', 'blocked', 'complete']

export default function ProjectsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { isAdmin } = useAuth()

    const [isOpen, setIsOpen] = useState(false)
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All')

    const [pendingDelete, setPendingDelete] = useState<Project | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0)
    }, [page, perPage])
    const [deadline, setDeadline] = useState('')
    const [status, setStatus] = useState<TaskStatus>('to_do')

    const { data: projects = [], isLoading } = useProjectsQuery()

    const [saveError, setSaveError] = useState<string | null>(null)
    const saveMutation = useSaveProjectMutation()
    const deleteMutation = useDeleteProjectMutation()

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                              (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const total = filteredProjects.length
    const last_page = Math.ceil(total / perPage) || 1
    const meta = { current_page: page, last_page, total }
    const paginatedProjects = filteredProjects.slice((page - 1) * perPage, page * perPage)

    function openAdd() {
        setName(''); setDescription(''); setDeadline(''); setStatus('to_do')
        setIsOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaveError(null)
        try {
            await saveMutation.mutateAsync({ payload: { name, description, deadline, status } })
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
        <div className="p-10 bg-zinc-950 h-full flex flex-col overflow-hidden">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Input
                        placeholder={t("projects.searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-xs h-9"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'All')}
                        className="h-9 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none focus:border-purple-500 cursor-pointer"
                    >
                        <option value="All">{t('tasks.filterAll')}</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>{t(`tasks.status.${s}`)}</option>
                        ))}
                    </select>

                    {isAdmin && (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger
                            onClick={openAdd}
                            render={<Button className="h-9">{t('projects.addButton')}</Button>}
                        />
                    <DialogContent className="max-w-110">
                        <DialogHeader>
                            <DialogTitle>{t('projects.newTitle')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.fieldName')}</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{t('projects.fieldDescription')}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground outline-none focus:border-ring resize-none h-48 overflow-y-auto"
                                    required
                                />
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
            </div>

            {isLoading ? (
                <p className="text-zinc-500">{t('projects.loading')}</p>
            ) : (
                <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 pr-2 border border-zinc-900 rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('projects.fieldName')}</TableHead>
                                <TableHead>{t('projects.fieldDescription')}</TableHead>
                                <TableHead className="text-center">{t('projects.fieldStatus')}</TableHead>
                                <TableHead className="text-center">{t('projects.fieldDeadline')}</TableHead>
                                {isAdmin && <TableHead className="text-center">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedProjects.map((project) => (
                                <TableRow
                                    key={project.id}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    className="cursor-pointer"
                                >
                                    <TableCell className="font-medium text-white">{project.name}</TableCell>
                                    <TableCell className="text-zinc-500 max-w-md truncate">{project.description}</TableCell>
                                    <TableCell className="text-center">
                                        <span className={cn("inline-flex items-center justify-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium", statusBadgeClass[project.status])}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDotClass[project.status])}></span>
                                            {t(`tasks.status.${project.status}`)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-center">{project.deadline?.slice(0, 10)}</TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-center gap-2 shrink-0">

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setPendingDelete(project)}
                                                >
                                                    {t('projects.delete')}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {projects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center text-sm text-zinc-500">
                                        {t('projects.empty')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {projects.length > 0 && (
                <PaginationFooter 
                    page={page} 
                    setPage={setPage} 
                    perPage={perPage} 
                    setPerPage={setPerPage} 
                    lastPage={meta.last_page} 
                    total={meta.total ?? 0} 
                />
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
