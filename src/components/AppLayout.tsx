import { Clock, Bell } from "lucide-react"
import { useTranslation } from "react-i18next"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "./app-sidebar"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useTimeTracking } from "@/hooks/useTimeTracking"
import { useDailyTotalTimeQuery } from "@/features/timeTracking"
import { useAuth } from "@/features/auth/AuthContext"

function formatTime(totalSeconds: number) {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
}

export default function AppLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { elapsedSeconds, isRunning, activeTaskId } = useTimeTracking()
    const { user, logout } = useAuth()
    const currentUser = user
    const initials = currentUser?.name.split(" ").map((w) => w[0]).join("").toUpperCase() ?? ""

    const { data: dailyTotalData, isFetching } = useDailyTotalTimeQuery(currentUser?.id)
    const baseTotalSeconds = typeof dailyTotalData === 'number' ? dailyTotalData : 0
    const displayTotalSeconds = baseTotalSeconds + (isRunning ? elapsedSeconds : 0)

    const getPageTitle = () => {
        const path = location.pathname
        if (path.startsWith('/tasks')) return t('sidebar.tasks')
        if (path.startsWith('/dashboard')) return t('sidebar.dashboard')
        if (path.startsWith('/stock')) return t('sidebar.stock')
        if (path.startsWith('/orders')) return t('sidebar.orders')
        if (path.startsWith('/returns')) return t('sidebar.returns')
        if (path.startsWith('/chat')) return t('sidebar.chat')
        if (path.startsWith('/admin/audit-logs')) return t('sidebar.auditLogs')
        if (path.startsWith('/admin')) return t('sidebar.admin')
        if (path.startsWith('/profile')) return t('profile.title')
        return t('sidebar.dashboard')
    }

    const title = getPageTitle()

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">

                <AppSidebar />

                <SidebarInset className="flex flex-1 flex-col bg-zinc-950 overflow-hidden">

                    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
                        <h1 className="text-sm font-semibold text-white capitalize">{title}</h1>

                        <div className="flex items-center gap-3">
                            <div 
                                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                    isRunning 
                                        ? "border-purple-500/30 bg-purple-500/10 text-purple-400 cursor-pointer hover:bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
                                        : "border-zinc-800 bg-transparent text-zinc-400"
                                }`}
                                onClick={() => {
                                    if (isRunning && activeTaskId) navigate(`/tasks/${activeTaskId}`)
                                }}
                                title={isRunning ? "Click to view active task" : "No active session"}
                            >
                                {isFetching && !isRunning ? (
                                    <>
                                        <div className="h-4 w-4 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        <Clock className={`h-4 w-4 ${isRunning ? "text-purple-400" : "text-zinc-500"}`} />
                                        {formatTime(displayTotalSeconds)}
                                    </>
                                )}
                            </div>
                            <button className="rounded-full p-2 text-zinc-400 hover:bg-zinc-900 transition-colors cursor-pointer bg-transparent border-none">
                                <Bell className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => navigate("/profile")}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-400 text-[10px] font-bold text-black select-none cursor-pointer border-none"
                            >
                                {initials}
                            </button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void logout()}
                            >
                                {t('auth.logout')}
                            </Button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto bg-zinc-950">
                        <Outlet />
                    </main>

                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}