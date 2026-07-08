import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Task, TaskStatus } from '@/types/task'
import { mockUsers } from '@/api/mockData'
import { mockProjects } from '@/api/mockProjects'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"

const mockTasks: Task[] = [
    { id: 1,project_id:1, title: "Implement authentication module", status: "in_progress", due_date: "2026-07-06", assignees: [mockUsers[0], mockUsers[3]] },
    { id: 2,project_id:1, title: "Dashboard redesign", status: "to_do", due_date: "2026-07-06", assignees: [mockUsers[1]] },
    { id: 3,project_id:2, title: "Orders API testing", status: "blocked", due_date: "2026-07-08", assignees: [mockUsers[2]] },
    { id: 4, project_id:2,title: "Write endpoint documentation", status: "complete", due_date: "2026-07-05", assignees: [mockUsers[3]] },
]

const statusBadgeClass: Record<TaskStatus, string> = {
    to_do: "bg-zinc-800/60 text-zinc-300 ring-1 ring-inset ring-zinc-700/60",
    in_progress: "bg-zinc-800/60 text-zinc-200 ring-1 ring-inset ring-zinc-700/60",
    blocked: "bg-zinc-800/60 text-zinc-200 ring-1 ring-inset ring-zinc-700/60",
    complete: "bg-zinc-800/60 text-zinc-400 ring-1 ring-inset ring-zinc-700/60",
}

const statusDotClass: Record<TaskStatus, string> = {
    to_do: "bg-zinc-500",
    in_progress: "bg-amber-400",
    blocked: "bg-rose-400",
    complete: "bg-emerald-400",
}

const avatarColors = [
    "bg-sky-600/80",
    "bg-violet-600/80",
    "bg-emerald-600/80",
    "bg-orange-600/80",
    "bg-pink-600/80",
    "bg-teal-600/80",
]

function avatarColorFor(id: number) {
    return avatarColors[id % avatarColors.length]
}

function initialsOf(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

function projectNameFor(id?: number) {
    return mockProjects.find((p) => p.id === id)?.name ?? '—'
}


export default function TasksPage() {
    const { t } = useTranslation()
    const [filter, setFilter] = useState<'All' | TaskStatus>("All")
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const statusLabels: Record<TaskStatus, string> = {
        to_do: t('tasks.status.to_do'),
        in_progress: t('tasks.status.in_progress'),
        blocked: t('tasks.status.blocked'),
        complete: t('tasks.status.complete'),
    }

    const [title, setTitle] = useState("")
    const [, setProject] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState<TaskStatus>("to_do")
    const [dueDate, setDueDate] = useState("2026-07-07")


    const filteredTasks = mockTasks.filter(task =>
        (filter === "All" || task.status === filter) &&
        task.title.toLowerCase().includes(search.toLowerCase())
    )

    function handleCreateTask(e: React.FormEvent) {
        e.preventDefault()
        console.log({ title, description, status, due_date: dueDate })

        setTitle("")
        setProject("")
        setDescription("")
        setStatus("to_do")
        setIsModalOpen(false)
    }

    return (
        <div className="p-10 flex flex-col gap-6 w-full bg-zinc-950">
            <div className="flex items-center gap-6 w-full">
                <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-850">
                    {(["All", "to_do", "in_progress", "blocked", "complete"] as const).map((btn) => (
                        <button
                            key={btn}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer border-none ${
                                filter === btn
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                            }`}
                            onClick={() => setFilter(btn)}
                        >
                            {btn === "All" ? t('tasks.filterAll') : statusLabels[btn]}
                        </button>
                    ))}
                </div>

                <div className="bg-transparent">
                    <input
                        type="text"
                        placeholder={t('tasks.searchPlaceholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-zinc-900 border border-zinc-850 rounded-lg px-4 py-1.5 text-zinc-300 placeholder-zinc-600 text-xs outline-none w-[240px] focus:border-purple-500/50 transition-colors"
                    />
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger className="ml-auto bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-purple-500/20 transition-colors border-none">
                        {t('tasks.addButton')}
                    </DialogTrigger>

                    <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-[440px] rounded-xl p-6 shadow-2xl">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-base font-bold text-white">{t('tasks.newTaskTitle')}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                            {/* Title */}
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
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('tasks.fieldDescription')}</label>
                                <textarea
                                    placeholder={t('tasks.fieldDescriptionPlaceholder')}
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700 transition-colors resize-none"
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
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-zinc-700 transition-colors dark:[color-scheme:dark]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-transparent text-zinc-400 hover:text-zinc-200 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    {t('tasks.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    {t('tasks.add')}
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <table className="w-full border-collapse text-left text-sm">
                <thead>
                <tr className="border-b border-zinc-900">
                    <th className="text-zinc-500 font-medium p-3">{t('tasks.columnTask')}</th>
                    <th className="text-zinc-500 front-medium p-3">{t('tasks.columnProject')}</th>
                    <th className="text-zinc-500 font-medium p-3">{t('tasks.columnAssigned')}</th>
                    <th className="text-zinc-500 font-medium p-3">{t('tasks.columnStatus')}</th>
                    <th className="text-zinc-500 font-medium p-3">{t('tasks.columnDue')}</th>
                </tr>
                </thead>
                <tbody>
                {filteredTasks.map((task) => (
                    <tr
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="cursor-pointer transition-colors border-b border-zinc-900 hover:bg-zinc-900/30"
                    >
                        <td className="p-3 text-zinc-200 font-medium">
                            <div className="flex items-center gap-3">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotClass[task.status]}`}></span>
                                <span className={task.status === "complete" ? "line-through text-zinc-500" : ""}>{task.title}</span>
                            </div>
                        </td>
                        <td className="p-3">
                            {projectNameFor(task.project_id)}
                        </td>
                        <td className="p-3">
                            <div className="flex items-center">
                                {task.assignees.map((user) => (
                                    <span
                                        key={user.id}
                                        title={user.name}
                                        className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold text-white ring-2 ring-zinc-950 -ml-2 first:ml-0 ${avatarColorFor(user.id)}`}
                                    >
                                        {initialsOf(user.name)}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="p-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${statusBadgeClass[task.status]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass[task.status]}`}></span>
                                {statusLabels[task.status]}
                            </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                            {task.due_date}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}