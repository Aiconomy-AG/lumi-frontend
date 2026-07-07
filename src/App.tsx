import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppSidebar } from "./components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardPage from "./pages/DashboardPage"
import TasksPage from "./pages/TasksPage"
import TaskDetailPage from "./pages/TaskDetailPage"
import AuthPage from "./pages/AuthPage"

export default function App() {
    const [user, setUser] = useState<boolean>(false)

    if (!user) {
        return <AuthPage onLogin={() => setUser(true)} />
    }

    return (
        <SidebarProvider className="layout-container">
            <AppSidebar />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/:id" element={<TaskDetailPage />} />
                </Routes>
            </main>
        </SidebarProvider>
    )
}