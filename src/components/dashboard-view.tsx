import { useEffect, useState } from 'react'
import { getUsers } from '../api/client'
import type { User } from '../types/user'

export function DashboardView() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            <div className="header-container">
                <h1 className="main-title">Dashboard</h1>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-left-panel">
                    <p className="current-date">Monday, July 6</p>
                    <h2 className="welcome-text">Good evening, Ana.</h2>

                    <div className="tasks-section">
                        <div className="tasks-header">
                            <h3>Due today <span className="tasks-count">3 tasks</span></h3>
                        </div>

                        <div className="tasks-list-container">
                            <div className="task-row">
                                <div className="task-main-info">
                                    <div className="task-dot"></div>
                                    <div>
                                        <p className="task-title-text">Implement authentication module</p>
                                        <p className="task-meta">Backend • AP RP</p>
                                    </div>
                                </div>
                                <span className="task-badge progress">In progress</span>
                            </div>

                            <div className="task-row">
                                <div className="task-main-info">
                                    <div className="task-dot"></div>
                                    <div>
                                        <p className="task-title-text">Dashboard redesign</p>
                                        <p className="task-meta">Frontend • MI</p>
                                    </div>
                                </div>
                                <span className="task-badge">To do</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-right-panel">
                    <h3 className="online-title">Online now <span className="online-count">{users.length} people</span></h3>

                    {loading && <p className="current-date">Loading...</p>}
                    {error && <p className="current-date">Error loading users</p>}

                    <ul className="online-users-list">
                        {users.map((user, index) => (
                            <li key={user.id} className="online-user-item">
                                <div className="avatar-placeholder">
                                    {user.name.substring(0, 2).toUpperCase()}
                                    <div className={`status-indicator ${index % 2 === 1 ? 'offline' : ''}`}></div>
                                </div>
                                <div className="online-user-info">
                                    <p className="online-user-name">{user.name}</p>
                                    <p className="online-user-status">{index % 2 === 1 ? 'Offline' : 'Active'}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}



