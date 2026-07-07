import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from "./pages/DashboardPage"
import TasksPage from "./pages/TasksPage"
import TaskDetailPage from "./pages/TaskDetailPage"
import StockPage from "./pages/StockPage"
import ChatPage from "./pages/ChatPage"
import AdminPage from "./pages/AdminPage"
import AuthPage from "./pages/AuthPage"
import AppLayout from "@/components/AppLayout"

export default function App() {
    const [user, setUser] = useState<boolean>(false)

    if (!user) {
        return <AuthPage onLogin={() => setUser(true)} />
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/admin" element={<AdminPage />} />
            </Route>
        </Routes>
    )
}