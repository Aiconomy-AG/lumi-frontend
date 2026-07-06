import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppSidebar } from "./components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardView } from "./components/dashboard-view"
import { TasksView } from "./components/tasks-view"
import { TaskDetailView } from "./components/task-detail-view"
import { AuthView } from "./components/authentification-view"

export default function App() {
    const [user, setUser] = useState<boolean>(false)

    if (!user) {
        return <AuthView onLogin={() => setUser(true)} />
    }

    return (
        <SidebarProvider className="layout-container">
            <AppSidebar />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route path="/dashboard" element={<DashboardView />} />
                    <Route path="/tasks" element={<TasksView />} />
                    <Route path="/tasks/:id" element={<TaskDetailView />} />
                </Routes>
            </main>
        </SidebarProvider>
    )
}