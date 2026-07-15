import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useElapsedSeconds, useTimeTracking } from '@/hooks/useTimeTracking'
import { useTimeEntriesQuery } from '@/features/timeTracking'
import { useTasksQuery, useUpdateTaskMutation, useAssignTaskMutation, useUnassignTaskMutation, useCreateTaskMutation } from '@/features/tasks'
import { useProjectsQuery } from '@/features/projects'
import { useUsersQuery } from '@/features/users'
import { avatarColorFor, initialsOf } from '@/components/ui/task-card'
import { useAuth } from '@/features/auth/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { TaskStatus } from '@/types/task'

export default function TaskDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const taskId = Number(id)
    const { user: currentUser } = useAuth()

    const { activeTaskId, startedAt, start, stop } = useTimeTracking()
    const elapsedSeconds = useElapsedSeconds(startedAt)
    const isRunning = activeTaskId === taskId

    const { data: entries = [] } = useTimeEntriesQuery(taskId)

    const { data: tasks = [], isLoading: isTasksLoading } = useTasksQuery()
    const { data: projects = [] } = useProjectsQuery()

    const task = tasks.find(t => t.id === taskId)
    const project = projects.find(p => p.id === task?.project_id)
    const { data: users = [] } = useUsersQuery()

    const updateTaskMutation = useUpdateTaskMutation()
    const assignTaskMutation = useAssignTaskMutation()
    const unassignTaskMutation = useUnassignTaskMutation()
    const createTaskMutation = useCreateTaskMutation()

    const subtasks = tasks.filter(t => t.parent_id === taskId)

    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editTitle, setEditTitle] = useState("")

    const [isEditingDesc, setIsEditingDesc] = useState(false)
    const [editDesc, setEditDesc] = useState("")

    const [isAssignOpen, setIsAssignOpen] = useState(false)
    const [userSearch, setUserSearch] = useState("")
    const [subtaskSearch, setSubtaskSearch] = useState('')
    const [timeEntrySearch, setTimeEntrySearch] = useState('')

    const [expandedUsers, setExpandedUsers] = useState<number[]>([])

    const [isAddSubtaskOpen, setIsAddSubtaskOpen] = useState(false)
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
    const [newSubtaskDesc, setNewSubtaskDesc] = useState("")
    const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false)

    useEffect(() => {
        if (task) {
            setEditTitle(task.title)
            setEditDesc(task.description || "")
        }
    }, [task?.title, task?.description])

    async function handleSaveTitle() {
        setIsEditingTitle(false)
        if (editTitle.trim() && editTitle !== task?.title) {
            await updateTaskMutation.mutateAsync({ id: taskId, payload: { title: editTitle } })
        } else {
            setEditTitle(task?.title || "")
        }
    }

    async function handleSaveDesc() {
        setIsEditingDesc(false)
        if (editDesc !== task?.description) {
            await updateTaskMutation.mutateAsync({ id: taskId, payload: { description: editDesc } })
        }
    }

    async function handleToggleAssignee(userId: number) {
        if (!task) return
        const currentIds = task.assignees?.map(u => u.id) || []

        if (currentIds.includes(userId)) {
            if (activeTaskId === taskId && currentUser?.id === userId) {
                await stop()
            }
            await unassignTaskMutation.mutateAsync({ taskId, employeeId: userId })
        } else {
            await assignTaskMutation.mutateAsync({ taskId, employeeId: userId })
        }
    }

    async function handleStatusChange(status: TaskStatus) {
        if (!task || task.status === status) return
        await updateTaskMutation.mutateAsync({ id: taskId, payload: { status } })
    }

    async function handleToggle() {
        if (isRunning) {
            await stop()
        } else {
            await start(taskId)
        }
    }

    async function handleAddSubtask() {
        if (!task || !newSubtaskTitle.trim()) return
        
        const formattedDueDate = task.due_date ? task.due_date.slice(0, 10) : new Date().toISOString().slice(0, 10)
        
        await createTaskMutation.mutateAsync({
            title: newSubtaskTitle,
            description: newSubtaskDesc.trim() || t('taskDetail.subtaskOf', { title: task.title }),
            status: "to_do",
            due_date: formattedDueDate,
            project_id: task.project_id!,
            parent_id: task.id
        })
        setNewSubtaskTitle("")
        setNewSubtaskDesc("")
        setIsAddSubtaskOpen(false)
    }

    const loggedSeconds = entries.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0)
    const seconds = loggedSeconds + (isRunning ? elapsedSeconds : 0)

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
        const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
        const secs = (totalSeconds % 60).toString().padStart(2, '0')
        return `${hrs}:${mins}:${secs}`
    }

    const isAssigned = task?.assignees?.some(a => a.id === currentUser?.id)

    const groupedEntries = entries.reduce((acc, entry) => {
        const isThisEntryActive = isRunning && !entry.stopped_at
        const duration = (entry.duration_seconds || 0) + (isThisEntryActive ? elapsedSeconds : 0)

        if (!acc[entry.employee_id]) {
            acc[entry.employee_id] = {
                employee_id: entry.employee_id,
                totalSeconds: 0,
                hasActive: false,
                entries: []
            }
        }

        acc[entry.employee_id].totalSeconds += duration
        if (isThisEntryActive) acc[entry.employee_id].hasActive = true
        acc[entry.employee_id].entries.push({ ...entry, computedDuration: duration, isActive: isThisEntryActive })

        return acc
    }, {} as Record<number, any>)

    const userGroups = Object.values(groupedEntries)

    return (
        <div className="p-6">

            <Button
                variant="ghost"
                size="sm"
                className="mb-6"
                onClick={() => navigate(-1)}
            >
                {t('taskDetail.back')}
            </Button>

            <div className="flex flex-col w-full">

                {isTasksLoading ? (
                    <p className="text-zinc-500">{t('dashboard.loading')}</p>
                ) : !task ? (
                    <p className="text-rose-400">{t('taskDetail.notFound')}</p>
                ) : (
                    <>
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
                            <h2
                                className="text-3xl font-bold text-white mb-2 cursor-text hover:bg-zinc-900 rounded px-2 -mx-2 transition-colors inline-block"
                                onClick={() => setIsEditingTitle(true)}
                                title="Click to edit"
                            >
                                {task.title}
                            </h2>
                        )}
                        <p className="text-xs text-zinc-500 mb-6">
                            {project?.name || '—'} • Due {task.due_date?.slice(0, 10)}
                        </p>

                        <div className="flex gap-2 mb-8">
                            <button 
                                onClick={() => handleStatusChange('to_do')}
                                disabled={updateTaskMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-full cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2 border ${task.status === 'to_do' ? 'bg-zinc-500/20 border-zinc-500/50 text-zinc-300 font-medium' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'to_do' ? 'bg-zinc-400' : 'bg-zinc-600'}`}></span>
                                {t('tasks.status.to_do')}
                            </button>
                            <button 
                                onClick={() => handleStatusChange('in_progress')}
                                disabled={updateTaskMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-full cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2 border ${task.status === 'in_progress' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 font-medium' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'in_progress' ? 'bg-amber-500' : 'bg-zinc-600'}`}></span>
                                {t('tasks.status.in_progress')}
                            </button>
                            <button 
                                onClick={() => handleStatusChange('blocked')}
                                disabled={updateTaskMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-full cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2 border ${task.status === 'blocked' ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 font-medium' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'blocked' ? 'bg-rose-500' : 'bg-zinc-600'}`}></span>
                                {t('tasks.status.blocked')}
                            </button>
                            <button 
                                onClick={() => handleStatusChange('complete')}
                                disabled={updateTaskMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-full cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2 border ${task.status === 'complete' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 font-medium' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'complete' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                                {t('tasks.status.complete')}
                            </button>
                        </div>


                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
                    <div className="flex flex-col">
                        <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">{t('taskDetail.currentSession')}</div>
                        <div className="text-3xl font-bold text-white font-mono tracking-wide">
                            {formatTime(isRunning ? elapsedSeconds : 0)}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {t('taskDetail.totalLogged')} <span className="text-purple-400 font-medium">{formatTime(seconds)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {!isAssigned ? (
                            <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                You are not assigned on this task!
                            </span>
                        ) : (
                            <button
                                className={`w-12 h-12 rounded-full border-none text-white text-sm flex items-center justify-center cursor-pointer transition-colors shadow-lg ${
                                    isRunning ? "bg-red-500 hover:bg-red-400" : "bg-purple-500 hover:bg-purple-400 text-black"
                                }`}
                                onClick={() => void handleToggle()}
                            >
                                {isRunning ? "■" : "▶"}
                            </button>
                        )}
                    </div>
                </div>


                <div className="mb-8 relative group">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('taskDetail.description')}</h4>
                    </div>
                    {isEditingDesc ? (
                        <div className="flex flex-col gap-2">
                            <textarea
                                autoFocus
                                onFocus={(e) => {
                                    const val = e.target.value;
                                    e.target.setSelectionRange(val.length, val.length);
                                }}
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700  rounded-lg p-3 text-sm text-zinc-200 outline-none resize-none h-48 overflow-y-auto"
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => { setIsEditingDesc(false); setEditDesc(task.description || "") }} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer border-none bg-transparent">{t('taskDetail.cancel')}</button>
                                <button onClick={handleSaveDesc} className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-md cursor-pointer border-none">{t('taskDetail.save')}</button>
                            </div>
                        </div>
                    ) : (
                        <p
                            className="text-sm text-zinc-300 leading-relaxed m-0 whitespace-pre-wrap cursor-text bg-zinc-900/30 hover:bg-zinc-900/50 p-3 rounded-lg transition-colors h-48 overflow-y-auto border border-transparent hover:border-zinc-800"
                            onClick={() => setIsEditingDesc(true)}
                        >
                            {task.description || <span className="text-zinc-500 italic">{t('taskDetail.emptyDescription')}</span>}
                        </p>
                    )}
                </div>


                <div className="mb-8">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{t('taskDetail.assignedTo')}</h4>
                    <div className="flex items-center gap-3 flex-wrap">
                        {task.assignees?.map(rawUser => {
                            const user = users.find(u => u.id === rawUser.id) || rawUser
                            return (
                                <div key={user.id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300">
                                    <span className={`flex items-center overflow-hidden justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white ${user.avatar_url ? 'bg-zinc-800' : avatarColorFor(user.id)}`}>
                                        {user.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : initialsOf(user.name)}
                                    </span>
                                    {user.name}
                                    <button
                                        onClick={() => handleToggleAssignee(user.id)}
                                        className="ml-1 text-zinc-500 hover:text-rose-400 cursor-pointer border-none bg-transparent flex items-center justify-center p-0"
                                        title="Unassign"
                                    >
                                        ×
                                    </button>
                                </div>
                            )
                        })}
                        {(!task.assignees || task.assignees.length === 0) && (
                            <div className="text-xs text-zinc-500 italic">{t('taskDetail.unassigned')}</div>
                        )}

                        <Dialog open={isAssignOpen} onOpenChange={(open) => { setIsAssignOpen(open); if (!open) setUserSearch(''); }}>
                            <DialogTrigger render={
                                <button className="bg-transparent border border-dashed border-zinc-800 text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                                    {t('taskDetail.assign')}
                                </button>
                            } />
                            <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 max-w-100">
                                <DialogHeader>
                                    <DialogTitle>{t('taskDetail.assignUsersTitle')}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                    <input
                                        type="text"
                                        placeholder={t('admin.searchPlaceholder')}
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 rounded-lg px-3 py-2 outline-none focus:border-purple-500 transition-colors"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-900/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 transition-colors">
                                    {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).length === 0 ? (
                                        <p className="text-xs text-zinc-500 text-center py-4">{t('taskDetail.noUsersFound')}</p>
                                    ) : (
                                        users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map(u => {
                                        const isAssigned = task.assignees?.some(a => a.id === u.id)
                                        return (
                                            <div
                                                key={u.id}
                                                className="flex items-center justify-between p-2 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
                                                onClick={() => handleToggleAssignee(u.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 overflow-hidden rounded-full flex items-center justify-center text-xs font-bold text-white ${u.avatar_url ? 'bg-zinc-800' : avatarColorFor(u.id)}`}>
                                                        {u.avatar_url ? <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" /> : initialsOf(u.name)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{u.name}</span>
                                                        <span className="text-[10px] text-zinc-500">{u.email}</span>
                                                    </div>
                                                </div>
                                                {isAssigned && <span className="text-purple-400 text-sm font-bold">✓</span>}
                                            </div>
                                        )
                                    })
                                )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>


                {task.parent_id == null && (
                    <div className="mb-8">
                        <div 
                            className="flex items-center justify-between mb-3 cursor-pointer group"
                            onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">{t('taskDetail.subtasks')}</h4>
                                <span className={`text-zinc-500 text-[10px] transition-transform duration-200 ${isSubtasksExpanded ? 'rotate-180' : ''}`}>▼</span>
                                <span className="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-mono">{subtasks.length}</span>
                            </div>
                            
                            <Dialog open={isAddSubtaskOpen} onOpenChange={setIsAddSubtaskOpen}>
                                <DialogTrigger render={
                                    <button 
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                    >
                                        {t('taskDetail.addSubtaskTrigger')}
                                    </button>
                                } />
                                <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100">
                                    <DialogHeader>
                                        <DialogTitle>{t('taskDetail.addSubtaskTitle')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-4 mt-4">
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder={t('taskDetail.subtaskTitlePlaceholder')}
                                            value={newSubtaskTitle}
                                            onChange={e => setNewSubtaskTitle(e.target.value)}
                                            className="bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 rounded-lg px-3 py-2 outline-none focus:border-purple-500 transition-colors"
                                        />
                                        <textarea
                                            placeholder={t('taskDetail.subtaskDescPlaceholder')}
                                            value={newSubtaskDesc}
                                            onChange={e => setNewSubtaskDesc(e.target.value)}
                                            rows={3}
                                            className="bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 rounded-lg px-3 py-2 outline-none focus:border-purple-500 transition-colors resize-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setIsAddSubtaskOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 cursor-pointer border-none bg-transparent">{t('taskDetail.cancel')}</button>
                                            <button 
                                                onClick={handleAddSubtask} 
                                                disabled={createTaskMutation.isPending || !newSubtaskTitle.trim()}
                                                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg cursor-pointer border-none transition-colors"
                                            >
                                                {createTaskMutation.isPending ? t('taskDetail.addingSubtask') : t('taskDetail.addSubtaskButton')}
                                            </button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        
                        {isSubtasksExpanded && (
                            <div className="flex flex-col gap-2 mt-2">
                                <input
                                    type="text"
                                    placeholder={t('taskDetail.searchSubtasks')}
                                    value={subtaskSearch}
                                    onChange={(e) => setSubtaskSearch(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 rounded-lg px-3 py-2 outline-none focus:border-purple-500 transition-colors"
                                />
                                <div className="flex flex-col gap-2 h-28 overflow-y-auto pr-2">
                                    {subtasks.filter(st => st.title.toLowerCase().includes(subtaskSearch.toLowerCase())).length === 0 ? (
                                        <div className="bg-zinc-900/50 border border-zinc-800/50 border-dashed rounded-xl p-6 text-sm text-zinc-500 italic text-center">
                                            No subtasks yet.
                                        </div>
                                    ) : (
                                        subtasks.filter(st => st.title.toLowerCase().includes(subtaskSearch.toLowerCase())).map(subtask => (
                                            <div 
                                                key={subtask.id} 
                                                onClick={() => navigate(`/tasks/${subtask.id}`)}
                                                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-3 rounded-xl cursor-pointer transition-colors group shrink-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        subtask.status === 'to_do' ? 'bg-zinc-500' :
                                                        subtask.status === 'in_progress' ? 'bg-amber-500' :
                                                        subtask.status === 'blocked' ? 'bg-rose-500' :
                                                        'bg-emerald-500'
                                                    }`} />
                                                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{subtask.title}</span>
                                                </div>
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider bg-zinc-950 px-2 py-1 rounded">
                                                    {t(`tasks.status.${subtask.status}`)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}


                <div className="mb-8 flex flex-col gap-2">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">{t('taskDetail.timeEntries')}</h4>
                    <input
                        type="text"
                        placeholder={t('taskDetail.searchTimeEntries')}
                        value={timeEntrySearch}
                        onChange={(e) => setTimeEntrySearch(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 rounded-lg px-3 py-2 outline-none focus:border-purple-500 transition-colors"
                    />
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-48 overflow-y-auto">
                        {userGroups.filter(group => {
                            const user = users.find(u => u.id === group.employee_id)
                            return user?.name.toLowerCase().includes(timeEntrySearch.toLowerCase())
                        }).length === 0 ? (
                            <div className="p-6 text-sm text-zinc-500 italic text-center">{t('taskDetail.noTimeLogged')}</div>
                        ) : (
                            userGroups.filter(group => {
                                const user = users.find(u => u.id === group.employee_id)
                                return user?.name.toLowerCase().includes(timeEntrySearch.toLowerCase())
                            }).map((group) => {
                                const user = users.find(u => u.id === group.employee_id)
                                const isExpanded = expandedUsers.includes(group.employee_id)

                                return (
                                    <div key={group.employee_id} className="flex flex-col border-b border-zinc-800/50 last:border-0">
                                        <div
                                            className="flex items-center justify-between p-4 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                                            onClick={() => setExpandedUsers(prev =>
                                                isExpanded ? prev.filter(id => id !== group.employee_id) : [...prev, group.employee_id]
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 overflow-hidden rounded-full flex items-center justify-center text-xs font-bold text-white ${user?.avatar_url ? 'bg-zinc-800' : user ? avatarColorFor(user.id) : 'bg-zinc-800'}`}>
                                                    {user?.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : (user ? initialsOf(user.name) : '?')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-zinc-200">{user?.name || 'Unknown User'}</span>
                                                    <span className="text-[10px] text-zinc-500">{group.entries.length} sessions</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-semibold text-purple-400 font-mono">
                                                        {formatTime(group.totalSeconds)}
                                                    </span>
                                                    {group.hasActive && (
                                                        <span className="text-[10px] text-amber-500 mt-0.5 flex items-center gap-1.5">
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                                            </span>
                                                            In Progress
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="flex flex-col bg-zinc-950/50 border-t border-zinc-800/30 p-2">
                                                {group.entries.map((entry: any, idx: number) => {
                                                    const startDate = new Date(entry.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                                                    return (
                                                        <div key={entry.id || idx} className="flex items-center justify-between p-2 rounded hover:bg-zinc-900/50 transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-zinc-500">→</span>
                                                                <span className="text-[11px] text-zinc-400">{startDate}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {entry.isActive ? (
                                                                    <span className="text-[10px] text-amber-500">{t('taskDetail.statusActive')}</span>
                                                                ) : (
                                                                    <span className="text-[10px] text-zinc-600">{t('taskDetail.statusDone')}</span>
                                                                )}
                                                                <span className="text-xs font-mono text-zinc-300 w-16 text-right">
                                                                    {formatTime(entry.computedDuration)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                    </>
                )}
            </div>
        </div>
    )
}
