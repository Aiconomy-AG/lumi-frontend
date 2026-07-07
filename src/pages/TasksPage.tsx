import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Task } from '@/types/task'

const mockTasks: Task[] = [
    { id: 1, title: "Implement authentication module", project: "Backend", priority: "High", status: "In progress", due: "2026-07-06", dotColor: "bg-red-500", assignees: [{ initials: "AP", color: "border-amber-700 text-amber-500" }, { initials: "RP", color: "border-teal-700 text-teal-400" }] },
    { id: 2, title: "Dashboard redesign", project: "Frontend", priority: "High", status: "To do", due: "2026-07-06", dotColor: "bg-red-500", assignees: [{ initials: "MI", color: "border-amber-700 text-amber-500" }] },
    { id: 3, title: "Orders API testing", project: "QA", priority: "Medium", status: "To do", due: "2026-07-08", dotColor: "bg-amber-500", assignees: [{ initials: "ED", color: "border-amber-700 text-amber-500" }] },
    { id: 4, title: "Write endpoint documentation", project: "Backend", priority: "Low", status: "Done", due: "2026-07-05", dotColor: "bg-zinc-500", isDone: true, assignees: [{ initials: "RP", color: "border-amber-700 text-amber-500" }] },
]

export default function TasksPage() {
    const [filter, setFilter] = useState<'All' | Task['status']>("All")
    const navigate = useNavigate()

    const filteredTasks = mockTasks.filter(task => filter === "All" || task.status === filter)

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

                <button className="ml-auto bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-purple-500/20 transition-colors">
                    + Add task
                </button>
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
