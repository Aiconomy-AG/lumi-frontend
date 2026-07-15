import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from "./pages/DashboardPage"
import TasksPage from "./pages/TasksPage"
import TaskDetailPage from "./pages/TaskDetailPage"
import StockPage from "./pages/StockPage"
import StockLogsPage from "./pages/StockLogsPage"
import ChatPage from "./pages/ChatPage"
import AdminPage from "./pages/AdminPage"
import AuditLogsPage from "./pages/AuditLogsPage"
import ProfilePage from "./pages/ProfilePage"
import AuthPage from "./pages/AuthPage"
import AppLayout from "@/components/AppLayout"
import { TimeTrackingProvider } from "@/hooks/useTimeTracking"
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import RequireAdmin from '@/features/auth/RequireAdmin'
import RequireStaff from '@/features/auth/RequireStaff'
import { useAuth } from '@/features/auth/AuthContext'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import ReturnsPage from '@/pages/ReturnsPage'
import ReturnDetailPage from '@/pages/ReturnDetailPage'
import ProjectsPage from "./pages/ProjectsPage"
import ProjectDetailPage from "./pages/ProjectDetailPage"
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import { CallProvider } from '@/features/calls'

export default function App() {
    const { user } = useAuth()

    return (
        <TimeTrackingProvider>
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<ProtectedRoute />}>
                <Route element={<CallProvider><AppLayout /></CallProvider>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/:id" element={<TaskDetailPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/stock" element={<StockPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/chat/:conversationId" element={<ChatPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route element={<RequireStaff />}>
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/orders/:id" element={<OrderDetailPage />} />
                        <Route path="/returns" element={<ReturnsPage />} />
                        <Route path="/returns/:id" element={<ReturnDetailPage />} />
                    </Route>
                    <Route element={<RequireAdmin />}>
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                        <Route path="/stock-logs" element={<StockLogsPage />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        </Routes>
        </TimeTrackingProvider>
    )
}
