import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function TaskDetailView() {
    const navigate = useNavigate()

    const [seconds, setSeconds] = useState(1)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1)
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isRunning])

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
        const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
        const secs = (totalSeconds % 60).toString().padStart(2, '0')
        return `${hrs}:${mins}:${secs}`
    }

    return (
        <>
            <div className="header-container">
                <div className="flex items-center gap-2">
                    <h1 className="main-title">Tasks</h1>
                    <span className="breadcrumb-sub">/ Implement authentication module</span>
                </div>
            </div>

            <div className="task-detail-wrapper">
                <button className="back-link-btn" onClick={() => navigate("/tasks")}>← Tasks</button>

                <div className="detail-centered-content">
                    <h2 className="detail-main-title">Implement authentication module</h2>
                    <p className="detail-meta-info">Backend • Due 2026-07-06</p>

                    <div className="detail-status-row">
                        <button className="status-pill-btn">To do</button>
                        <button className="status-pill-btn active">In progress</button>
                        <button className="status-pill-btn">Done</button>
                    </div>

                    <div className="time-tracker-card">
                        <div className="tracker-inner">
                            <div className="tracker-label">Time tracking</div>
                            <div className="tracker-digits">{formatTime(seconds)}</div>
                            <div className="tracker-total-logged">
                                Total logged: <span className="highlight-purple">{formatTime(seconds)}</span>
                            </div>
                        </div>

                        <button
                            className={isRunning ? "tracker-stop-btn" : "tracker-play-btn"}
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? "■" : "▶"}
                        </button>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">≡ Description</h4>
                        <p className="section-body-text">
                            JWT + refresh tokens. Login, logout, session validation on each request. Sessions expire after 24h.
                        </p>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">👥 Assigned to</h4>
                        <div className="assignees-row">
                            <div className="assigned-user-badge">
                                <span className="badge-avatar-circle amber">AP</span>
                                Ana Popescu
                            </div>
                            <div className="assigned-user-badge">
                                <span className="badge-avatar-circle teal">RP</span>
                                Radu Popa
                            </div>
                            <button className="assign-more-btn">+ Assign</button>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">🕒 Time entries</h4>
                        <div className="time-entries-container">
                            <div className="time-entry-row">
                                <div className="entry-left">
                                    <span className="entry-icon">🕒</span>
                                    <div>
                                        <p className="entry-title">Implement authentication module</p>
                                        <p className="entry-subtitle">Ana Popescu • 2026-07-06</p>
                                    </div>
                                </div>
                                <span className="entry-duration">{formatTime(seconds)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}