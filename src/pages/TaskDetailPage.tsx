import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTimeTracking } from '@/hooks/useTimeTracking'

export default function TaskDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const taskId = Number(id)

    const { activeTaskId, todaySeconds, start, stop } = useTimeTracking()
    const isRunning = activeTaskId === taskId
    const seconds = todaySeconds

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
        const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
        const secs = (totalSeconds % 60).toString().padStart(2, '0')
        return `${hrs}:${mins}:${secs}`
    }

    return (
        <div className="p-10 max-w-[680px] mx-auto w-full bg-zinc-950">

            <button
                className="bg-transparent border-none text-zinc-500 hover:text-zinc-200 text-sm font-medium cursor-pointer mb-6 transition-colors"
                onClick={() => navigate("/tasks")}
            >
                {t('taskDetail.back')}
            </button>

            <div className="flex flex-col w-full">

                <h2 className="text-3xl font-bold text-white mb-2">Implement authentication module</h2>
                <p className="text-xs text-zinc-500 mb-6">Backend • Due 2026-07-06</p>

                <div className="flex gap-2 mb-8">
                    <button className="px-4 py-1.5 text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md cursor-pointer hover:bg-zinc-800 transition-colors">
                        {t('tasks.status.to_do')}
                    </button>
                    <button className="px-4 py-1.5 text-xs bg-purple-500/10 border border-purple-500 text-purple-400 rounded-md cursor-pointer font-medium">
                        {t('tasks.status.in_progress')}
                    </button>
                    <button className="px-4 py-1.5 text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md cursor-pointer hover:bg-zinc-800 transition-colors">
                        {t('tasks.status.blocked')}
                    </button>
                    <button className="px-4 py-1.5 text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md cursor-pointer hover:bg-zinc-800 transition-colors">
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
                            isRunning ? "bg-red-500 hover:bg-red-400" : "bg-purple-500 hover:bg-purple-400 text-black"
                        }`}
                        onClick={() => (isRunning ? stop() : start(taskId))}
                    >
                        {isRunning ? "■" : "▶"}
                    </button>
                </div>


                <div className="mb-8">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{t('taskDetail.description')}</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed m-0">
                        JWT + refresh tokens. Login, logout, session validation on each request. Sessions expire after 24h.
                    </p>
                </div>

                <div className="mb-8">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{t('taskDetail.assignedTo')}</h4>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300">
                            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">AP</span>
                            Ana Popescu
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300">
                            <span className="text-[10px] font-bold bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded">RP</span>
                            Radu Popa
                        </div>
                        <button className="bg-transparent border border-dashed border-zinc-800 text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors">
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
                                    <p className="text-xs font-medium text-zinc-200 m-0">Implement authentication module</p>
                                    <p className="text-[11px] text-zinc-500 m-0 mt-0.5">Ana Popescu • 2026-07-06</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-purple-400 font-mono">{formatTime(seconds)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
