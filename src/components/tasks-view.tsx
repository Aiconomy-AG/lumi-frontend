import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const mockTasks = [
    { id: 1, title: "Implement authentication module", project: "Backend", priority: "High", status: "In progress", due: "2026-07-06", dotColor: "#ef4444", assignees: [{ initials: "AP", color: "#b45309" }, { initials: "RP", color: "#0d9488" }] },
    { id: 2, title: "Dashboard redesign", project: "Frontend", priority: "High", status: "To do", due: "2026-07-06", dotColor: "#ef4444", assignees: [{ initials: "MI", color: "#b45309" }] },
    { id: 3, title: "Orders API testing", project: "QA", priority: "Medium", status: "To do", due: "2026-07-08", dotColor: "#f59e0b", assignees: [{ initials: "ED", color: "#b45309" }] },
    { id: 4, title: "Write endpoint documentation", project: "Backend", priority: "Low", status: "Done", due: "2026-07-05", dotColor: "#71717a", isDone: true, assignees: [{ initials: "RP", color: "#b45309" }] },
]

export function TasksView() {
    const [filter, setFilter] = useState("All")
    const navigate = useNavigate()

    return (
        <>
            <div className="header-container">
                <h1 className="main-title">Tasks</h1>
            </div>

            <div className="tasks-page-wrapper">
                <div className="tasks-toolbar">
                    <div className="filter-group">
                        {["All", "To do", "In progress", "Done"].map((btn) => (
                            <button
                                key={btn}
                                className={`filter-btn ${filter === btn ? "active" : ""}`}
                                onClick={() => setFilter(btn)}
                            >
                                {btn}
                            </button>
                        ))}
                    </div>
                    <div className="search-box">
                        <input type="text" placeholder="Search tasks..." />
                    </div>
                    <button className="add-task-btn">+ Add task</button>
                </div>

                <table className="tasks-table">
                    <thead>
                    <tr>
                        <th>Task</th>
                        <th>Project</th>
                        <th>Assigned</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mockTasks.map((task) => (
                        <tr
                            key={task.id}
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="table-row-clickable"
                        >
                            <td>
                                <div className="table-task-title">
                                    <span className="task-row-dot" style={{ backgroundColor: task.dotColor }}></span>
                                    <span className={task.isDone ? "text-strikethrough" : ""}>{task.title}</span>
                                </div>
                            </td>
                            <td className="text-muted">{task.project}</td>
                            <td>
                                <div className="stacked-avatars">
                                    {task.assignees.map((as, idx) => (
                                        <span key={idx} className="mini-avatar" style={{ border: `1px solid ${as.color}`, color: as.color }}>{as.initials}</span>
                                    ))}
                                </div>
                            </td>
                            <td className="text-muted">{task.priority}</td>
                            <td>
                                <span className={`task-badge ${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span>
                            </td>
                            <td className={`due-date-cell ${task.due === '2026-07-06' ? 'due-today' : ''}`}>{task.due}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}