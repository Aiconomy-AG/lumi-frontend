import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useProjectQuery, useSaveProjectMutation } from '@/features/projects'
import { useTasksQuery } from '@/features/tasks'
import { useAuth } from '@/features/auth/AuthContext'
import { TaskCard } from '@/components/ui/task-card'
import { CreateTaskModal } from '@/components/ui/create-task-modal'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import type { TaskStatus } from '@/types/task'

export default function ProjectDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const projectId = Number(id)
    const { isAdmin } = useAuth()

    const { data: project } = useProjectQuery(projectId)
    const { data: allTasks = [] } = useTasksQuery()
    const saveProjectMutation = useSaveProjectMutation()

    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editTitle, setEditTitle] = useState("")

    const [isEditingDesc, setIsEditingDesc] = useState(false)
    const [editDesc, setEditDesc] = useState("")

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All')

    const STATUSES: TaskStatus[] = ['to_do', 'in_progress', 'blocked', 'complete']

    useEffect(() => {
        if (project) {
            setEditTitle(project.name)
            setEditDesc(project.description)
        }
    }, [project?.name, project?.description])

    async function handleSaveTitle() {
        setIsEditingTitle(false)
        if (editTitle.trim() && editTitle !== project?.name) {
            await saveProjectMutation.mutateAsync({ 
                id: projectId, 
                payload: { 
                    name: editTitle, 
                    description: project?.description || "", 
                    status: project?.status || "to_do", 
                    deadline: project?.deadline || "" 
                } 
            })
        } else {
            setEditTitle(project?.name || "")
        }
    }

    async function handleSaveDesc() {
        setIsEditingDesc(false)
        if (editDesc !== project?.description) {
            await saveProjectMutation.mutateAsync({ 
                id: projectId, 
                payload: { 
                    name: project?.name || "", 
                    description: editDesc, 
                    status: project?.status || "to_do", 
                    deadline: project?.deadline || "" 
                } 
            })
        }
    }

    async function handleStatusChange(status: TaskStatus) {
        if (!project || project.status === status) return
        await saveProjectMutation.mutateAsync({ 
            id: projectId, 
            payload: { 
                name: project.name, 
                description: project.description || "", 
                status, 
                deadline: project.deadline || "" 
            } 
        })
    }

    async function handleDeadlineChange(newDeadline: string) {
        if (!project || project.deadline === newDeadline) return
        await saveProjectMutation.mutateAsync({ 
            id: projectId, 
            payload: { 
                name: project.name, 
                description: project.description || "", 
                status: project.status || "to_do", 
                deadline: newDeadline 
            } 
        })
    }

    const tasks = allTasks.filter((task) => task.project_id === projectId && task.parent_id == null)

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="p-6">
            <Button
                variant="ghost"
                size="sm"
                className="mb-6"
                onClick={() => navigate('/projects')}
            >
                ← {t('projects.title')}
            </Button>

            <div className="flex flex-col w-full">

                {isEditingTitle ? (
                    <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                        className="text-3xl font-bold text-white mb-2 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 outline-none w-full"
                    />
                ) : (
                    <h1
                        className={`text-3xl font-bold text-white mb-2 inline-block rounded px-2 -mx-2 transition-colors w-fit ${isAdmin ? 'cursor-text hover:bg-zinc-900' : ''}`}
                        onClick={() => { if (isAdmin) setIsEditingTitle(true) }}
                        title={isAdmin ? "Click to edit" : undefined}
                    >
                        {project?.name}
                    </h1>
                )}
                
                {project && (
                    <div className="flex items-center gap-2 mb-6 text-xs text-zinc-500">
                        <span>{t('projects.fieldDeadline')}:</span>
                        {isAdmin ? (
                            <Input 
                                type="date" 
                                value={project?.deadline?.slice(0, 10) || ''} 
                                onChange={(e) => handleDeadlineChange(e.target.value)}
                                className="h-7 w-32.5 px-2 text-xs bg-zinc-900 border border-zinc-800 rounded-md outline-none focus:border-zinc-600 transition-colors cursor-pointer text-zinc-300"
                            />
                        ) : (
                            <span className="text-zinc-400">{project?.deadline?.slice(0, 10) || '—'}</span>
                        )}
                    </div>
                )}

                {project && (
                    <>
                        <div className="flex gap-2 mb-4 mt-2">
                            <button
                                onClick={() => { if (isAdmin) handleStatusChange('to_do') }}
                                disabled={!isAdmin || saveProjectMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 border ${project.status === 'to_do' ? 'bg-zinc-500/20 border-zinc-500/50 text-zinc-300 font-medium' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'} ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'to_do' ? 'bg-zinc-400' : 'bg-zinc-600'}`}></span>
                                {t('tasks.status.to_do')}
                            </button>
                            <button
                                onClick={() => { if (isAdmin) handleStatusChange('in_progress') }}
                                disabled={!isAdmin || saveProjectMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 border ${project.status === 'in_progress' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 font-medium' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'} ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'in_progress' ? 'bg-amber-500' : 'bg-zinc-600'}`}></span>
                                {t('tasks.status.in_progress')}
                            </button>
                            <button
                                onClick={() => { if (isAdmin) handleStatusChange('blocked') }}
                                disabled={!isAdmin || saveProjectMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 border ${project.status === 'blocked' ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 font-medium' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'} ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'blocked' ? 'bg-rose-500' : 'bg-zinc-600'}`}></span>
                                {t('tasks.status.blocked')}
                            </button>
                            <button
                                onClick={() => { if (isAdmin) handleStatusChange('complete') }}
                                disabled={!isAdmin || saveProjectMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 border ${project.status === 'complete' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 font-medium' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'} ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'complete' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                                {t('tasks.status.complete')}
                            </button>
                        </div>
                    </>
                )}

            {isEditingDesc ? (
                <div className="flex flex-col gap-2 mt-2 w-full mb-4">
                    <textarea
                        autoFocus
                        onFocus={(e) => {
                            const val = e.target.value;
                            e.target.setSelectionRange(val.length, val.length);
                        }}
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 outline-none resize-none h-100 overflow-y-auto"
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { setIsEditingDesc(false); setEditDesc(project?.description || "") }} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer border-none bg-transparent">{t('projects.cancel')}</button>
                        <button onClick={handleSaveDesc} className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-md cursor-pointer border-none">{t('projects.save')}</button>
                    </div>
                </div>
            ) : (
                <p
                    className={`text-sm text-zinc-300 leading-relaxed m-0 whitespace-pre-wrap p-3 -mx-3 rounded-lg transition-colors h-100 overflow-y-auto w-full border border-transparent mb-4 ${isAdmin ? 'cursor-text bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-800' : ''}`}
                    onClick={() => { if (isAdmin) setIsEditingDesc(true) }}
                >
                    {project?.description || <span className="text-zinc-500 italic">{t('projects.emptyDescription') || 'No description'}</span>}
                </p>
            )}

            <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Input
                        placeholder={t("tasks.searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 h-9"
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
                    <CreateTaskModal defaultProjectId={projectId}>
                        <Button className={"h-9"}>{t('projects.addTask')}</Button>
                    </CreateTaskModal>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto border border-zinc-900 rounded-md bg-zinc-900">
                {filteredTasks.length === 0 ? (
                    <div className="p-4"><p className="text-sm text-zinc-600">{t('projects.noTasks')}</p></div>
                ) : (
                    <Table>
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
                            {filteredTasks.map((task) => (
                                <TaskCard 
                                    key={task.id}
                                    taskId={task.id}
                                    title={task.title}
                                    projectName={project?.name || '—'}
                                    assignees={task.assignees || []}
                                    status={task.status}
                                    dueDate={task.due_date}
                                    statusLabel={t(`tasks.status.${task.status}`)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
            </div>
        </div>
    )
}
