import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTimeTracking } from '@/hooks/useTimeTracking'
import { useTimeEntriesQuery } from '@/features/timeTracking'
import { useTasksQuery, useUpdateTaskMutation } from '@/features/tasks'
import { useProjectsQuery } from '@/features/projects'
import type { TaskStatus } from '@/types/task'

export default function TaskDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const taskId = Number(id)

    const { activeTaskId, elapsedSeconds, start, stop } = useTimeTracking()
    const isRunning = activeTaskId === taskId

    const { data: entries = [] } = useTimeEntriesQuery(taskId)

    const { data: tasks = [], isLoading: isTasksLoading } = useTasksQuery()
    const { data: projects = [] } = useProjectsQuery()

    const task = tasks.find(t => t.id === taskId)
    const project = projects.find(p => p.id === task?.project_id)

    const updateTaskMutation = useUpdateTaskMutation()

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

    const loggedSeconds = entries.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0)
    const seconds = loggedSeconds + (isRunning ? elapsedSeconds : 0)

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
        const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
        const secs = (totalSeconds % 60).toString().padStart(2, '0')
        return `${hrs}:${mins}:${secs}`
    }

    return (
        <div className="p-10 max-w-170 mx-auto w-full bg-zinc-950">

            <button
                className="btn-sm mb-6"
                onClick={() => navigate(-1)}
            >
                {t('taskDetail.back')}
            </button>

            <div className="flex flex-col w-full">

                {isTasksLoading ? (
                    <p className="text-zinc-500">{t('dashboard.loading')}</p>
                ) : !task ? (
                    <p className="text-rose-400">Task not found</p>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-white mb-2">{task.title}</h2>
                        <p className="text-xs text-zinc-500 mb-6">
                            {project?.name || '—'} • Due {task.due_date?.slice(0, 10)}
                        </p>

                        <div className="flex gap-2 mb-8">
                            <button 
                                onClick={() => handleStatusChange('to_do')}
                                disabled={updateTaskMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-md cursor-pointer transition-colors disabled:opacity-50 ${task.status === 'to_do' ? 'bg-purple-600 text-white font-medium' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                                {t('tasks.status.to_do')}
                            </button>
                            <button 
                                onClick={() => handleStatusChange('in_progress')}
                                disabled={updateTaskMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-md cursor-pointer transition-colors disabled:opacity-50 ${task.status === 'in_progress' ? 'bg-purple-600 text-white font-medium' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                                {t('tasks.status.in_progress')}
                            </button>
                            <button 
                                onClick={() => handleStatusChange('blocked')}
                                disabled={updateTaskMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-md cursor-pointer transition-colors disabled:opacity-50 ${task.status === 'blocked' ? 'bg-purple-600 text-white font-medium' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                                {t('tasks.status.blocked')}
                            </button>
                            <button 
                                onClick={() => handleStatusChange('complete')}
                                disabled={updateTaskMutation.isPending}
                                className={`px-4 py-1.5 text-xs rounded-md cursor-pointer transition-colors disabled:opacity-50 ${task.status === 'complete' ? 'bg-purple-600 text-white font-medium' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                                {t('tasks.status.complete')}
                            </button>
                        </div>


                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
                    <div className="flex flex-col">
                        <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">{t('taskDetail.timeTracking')}</div>
                        <div className="text-3xl font-bold text-white font-mono tracking-wide">{formatTime(seconds)}</div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {t('taskDetail.totalLogged')} <span className="text-purple-400 font-medium">{formatTime(seconds)}</span>
                        </div>
                    </div>

                    <button
                        className={`w-12 h-12 rounded-full border-none text-white text-sm flex items-center justify-center cursor-pointer transition-colors shadow-lg ${
                            isRunning ? "bg-red-500 hover:bg-red-400" : "bg-purple-600 hover:bg-purple-500"
                        }`}
                        onClick={() => void handleToggle()}
                    >
                        {isRunning ? "■" : "▶"}
                    </button>
                </div>


                <div className="mb-8">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{t('taskDetail.description')}</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed m-0 whitespace-pre-wrap">
                        {task.description || "No description provided."}
                    </p>
                </div>

                <div className="mb-8">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{t('taskDetail.assignedTo')}</h4>
                    <div className="flex items-center gap-3 flex-wrap">
                        {task.assignees?.map(user => (
                            <div key={user.id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300">
                                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
                                    {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                                </span>
                                {user.name}
                            </div>
                        ))}
                        {(!task.assignees || task.assignees.length === 0) && (
                            <div className="text-xs text-zinc-500 italic">Unassigned</div>
                        )}
                        <button className="btn-sm">
                            {t('taskDetail.assign')}
                        </button>
                    </div>
                </div>


                <div className="mb-8">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{t('taskDetail.timeEntries')}</h4>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-zinc-500">🕒</span>
                                <div>
                                    <p className="text-xs font-medium text-zinc-200 m-0">{task.title}</p>
                                    <p className="text-[11px] text-zinc-500 m-0 mt-0.5">
                                        {task.assignees?.[0]?.name || 'Unknown'} • {task.due_date?.slice(0, 10)}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-purple-400 font-mono">{formatTime(seconds)}</span>
                        </div>
                    </div>
                </div>

                    </>
                )}
            </div>
        </div>
    )
}
