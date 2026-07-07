import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Task } from '@/types/task'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"

const mockTasks: Task[] = [
    { id: 1, title: "Implement authentication module", project: "Backend", priority: "High", status: "In progress", due: "2026-07-06", dotColor: "bg-red-500", assignees: [{ initials: "AP", color: "border-amber-700 text-amber-500" }, { initials: "RP", color: "border-teal-700 text-teal-400" }] },
    { id: 2, title: "Dashboard redesign", project: "Frontend", priority: "High", status: "To do", due: "2026-07-06", dotColor: "bg-red-500", assignees: [{ initials: "MI", color: "border-amber-700 text-amber-500" }] },
    { id: 3, title: "Orders API testing", project: "QA", priority: "Medium", status: "To do", due: "2026-07-08", dotColor: "bg-amber-500", assignees: [{ initials: "ED", color: "border-amber-700 text-amber-500" }] },
    { id: 4, title: "Write endpoint documentation", project: "Backend", priority: "Low", status: "Done", due: "2026-07-05", dotColor: "bg-zinc-500", isDone: true, assignees: [{ initials: "RP", color: "border-amber-700 text-amber-500" }] },
]

export default function TasksPage() {
    const [filter, setFilter] = useState<'All' | Task['status']>("All")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState("To do")
    const [priority, setPriority] = useState("Medium")
    const [project, setProject] = useState("")
    const [dueDate, setDueDate] = useState("2026-07-07")

    const filteredTasks = mockTasks.filter(task => filter === "All" || task.status === filter)

    function handleCreateTask(e: React.FormEvent) {
        e.preventDefault()
        console.log({ title, description, status, priority, project, dueDate })

        setTitle("")
        setDescription("")
        setStatus("To do")
        setPriority("Medium")
        setProject("")
        setIsModalOpen(false)
    }

    return (
        <div className="p-10 flex flex-col gap-6 w-full bg-zinc-950">
            <div className="flex items-center gap-6 w-full">
                <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-850">
                    {(["All", "To do", "In progress", "Done"] as const).map((btn) => (
                        <button
                            key={btn}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer border-none ${
                                filter === btn
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                            }`}
                            onClick={() => setFilter(btn)}
                        >
                            {btn}
                        </button>
                    ))}
                </div>

                <div className="bg-transparent">
                    <input
                        type="text"
                        placeholder="Search tasks..."
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Status</label>
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none cursor-pointer focus:border-zinc-700"
                                    >
                                        <option value="To do">To do</option>
                                        <option value="In progress">In progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Priority</label>
                                    <select
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none cursor-pointer focus:border-zinc-700"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>


                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Project</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Backend"
                                    value={project}
                                    onChange={e => setProject(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700 transition-colors"
                                />
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
                                    className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
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
                    <th className="text-zinc-500 font-medium p-3">Project</th>
                    <th className="text-zinc-500 font-medium p-3">Assigned</th>
                    <th className="text-zinc-500 font-medium p-3">Priority</th>
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
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.dotColor}`}></span>
                                <span className={task.isDone ? "line-through text-zinc-500" : ""}>{task.title}</span>
                            </div>
                        </td>
                        <td className="p-3 text-zinc-500">{task.project}</td>
                        <td className="p-3">
                            <div className="flex gap-1">
                                {task.assignees.map((as, idx) => (
                                    <span
                                        key={idx}
                                        className={`text-[10px] font-bold border px-1.5 py-0.5 rounded bg-zinc-950 ${as.color}`}
                                    >
                                        {as.initials}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="p-3 text-zinc-500">{task.priority}</td>
                        <td className="p-3">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                task.status === "In progress" ? "bg-amber-500/10 text-amber-500" :
                                    task.status === "Done" ? "bg-green-500/10 text-green-500" :
                                        "bg-zinc-900 text-zinc-400"
                            }`}>
                                {task.status}
                            </span>
                        </td>
                        <td className={`p-3 text-zinc-400 ${
                            task.due === '2026-07-06' ? 'text-amber-500 font-medium' : ''
                        }`}>
                            {task.due}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}