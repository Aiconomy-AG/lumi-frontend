import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Task, TaskStatus } from '@/types/task'
import { mockUsers } from '@/api/mockData'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"

const mockTasks: Task[] = [
    { id: 1, title: "Implement authentication module", status: "in_progress", created_by: 1, due_date: "2026-07-06", assignees: [mockUsers[0], mockUsers[3]] },
    { id: 2, title: "Dashboard redesign", status: "pending", created_by: 1, due_date: "2026-07-06", assignees: [mockUsers[1]] },
    { id: 3, title: "Orders API testing", status: "pending", created_by: 1, due_date: "2026-07-08", assignees: [mockUsers[2]] },
    { id: 4, title: "Write endpoint documentation", status: "completed", created_by: 1, due_date: "2026-07-05", assignees: [mockUsers[3]] },
]

const statusLabels: Record<TaskStatus, string> = {
    pending: "Pending",
    in_progress: "In progress",
    completed: "Completed",
    overdue: "Overdue",
}

const statusBadgeClass: Record<TaskStatus, string> = {
    pending: "bg-zinc-900 text-zinc-400",
    in_progress: "bg-amber-500/10 text-amber-500",
    completed: "bg-green-500/10 text-green-500",
    overdue: "bg-red-500/10 text-red-500",
}

const statusDotClass: Record<TaskStatus, string> = {
    pending: "bg-zinc-500",
    in_progress: "bg-amber-500",
    completed: "bg-green-500",
    overdue: "bg-red-500",
}

function initialsOf(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase()
}

export default function TasksPage() {
    const [filter, setFilter] = useState<'All' | TaskStatus>("All")
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState<TaskStatus>("pending")
    const [dueDate, setDueDate] = useState("2026-07-07")

    const filteredTasks = mockTasks.filter(task =>
        (filter === "All" || task.status === filter) &&
        task.title.toLowerCase().includes(search.toLowerCase())
    )

    function handleCreateTask(e: React.FormEvent) {
        e.preventDefault()
        console.log({ title, description, status, due_date: dueDate })

        setTitle("")
        setDescription("")
        setStatus("pending")
        setIsModalOpen(false)
    }

    return (
        <div className="p-10 flex flex-col gap-6 w-full bg-zinc-950">
            <div className="flex items-center gap-6 w-full">
                <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-850">
                    {(["All", "pending", "in_progress", "completed", "overdue"] as const).map((btn) => (
                        <button
                            key={btn}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer border-none ${
                                filter === btn
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                            }`}
                            onClick={() => setFilter(btn)}
                        >
                            {btn === "All" ? btn : statusLabels[btn]}
                        </button>
                    ))}
                </div>

                <div className="bg-transparent">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-zinc-900 border border-zinc-850 rounded-lg px-4 py-1.5 text-zinc-300 placeholder-zinc-600 text-xs outline-none w-[240px] focus:border-purple-500/50 transition-colors"
                    />
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger className="ml-auto bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-purple-500/20 transition-colors border-none">
                        + Add task
                    </DialogTrigger>

                    <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-[440px] rounded-xl p-6 shadow-2xl">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-base font-bold text-white">New task</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                            {/* Title */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Title</label>
                                <input
                                    type="text"
                                    placeholder="Describe the task.."
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700 transition-colors"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Description</label>
                                <textarea
                                    placeholder="Additional details..."
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as TaskStatus)}
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none cursor-pointer focus:border-zinc-700"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>


                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Due date</label>
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    + Add
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <table className="w-full border-collapse text-left text-sm">
                <thead>
                <tr className="border-b border-zinc-900">
                    <th className="text-zinc-500 font-medium p-3">Task</th>
                    <th className="text-zinc-500 font-medium p-3">Assigned</th>
                    <th className="text-zinc-500 font-medium p-3">Status</th>
                    <th className="text-zinc-500 font-medium p-3">Due</th>
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
                                <span className={task.status === "completed" ? "line-through text-zinc-500" : ""}>{task.title}</span>
                            </div>
                        </td>
                        <td className="p-3">
                            <div className="flex gap-1">
                                {task.assignees.map((user) => (
                                    <span
                                        key={user.id}
                                        className="text-[10px] font-bold border border-amber-700 text-amber-500 px-1.5 py-0.5 rounded bg-zinc-950"
                                    >
                                        {initialsOf(user.name)}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="p-3">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusBadgeClass[task.status]}`}>
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