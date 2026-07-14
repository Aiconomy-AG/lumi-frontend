import { useEffect, useRef, useState } from "react"
import { Clock, Bell, Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useElapsedSeconds, useTimeTracking } from "@/hooks/useTimeTracking"
import { useDailyTotalTimeQuery } from "@/features/timeTracking"
import { useAuth } from "@/features/auth/AuthContext"
import { avatarColorFor } from "@/components/ui/task-card"
import {
    NotificationCenter,
    RealtimeNotificationPopup,
    useNotificationsQuery,
} from "@/features/notifications"
import { GlobalSearchDialog, SearchTrigger } from "@/features/search"

function formatTime(totalSeconds: number) {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
}

function HeaderClock({ userId }: { userId?: number }) {
    const navigate = useNavigate()
    const { startedAt, isRunning, activeTaskId } = useTimeTracking()
    const elapsedSeconds = useElapsedSeconds(startedAt)
    const { data: dailyTotalData, isFetching } = useDailyTotalTimeQuery(userId)

    const baseTotalSeconds = typeof dailyTotalData === 'number' ? dailyTotalData : 0
    const displayTotalSeconds = baseTotalSeconds + (isRunning ? elapsedSeconds : 0)

    return (
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
                <div className="h-4 w-4 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
            ) : (
                <>
                    <Clock className={`h-4 w-4 ${isRunning ? "text-purple-400" : "text-zinc-500"}`} />
                    {formatTime(displayTotalSeconds)}
                </>
            )}
        </div>
    )
}

export default function AppLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { user } = useAuth()
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const notificationsRef = useRef<HTMLDivElement>(null)
    const currentUser = user
    const initials = currentUser?.name.split(" ").map((w) => w[0]).join("").toUpperCase() ?? ""

    const { data: unreadNotifications = [] } = useNotificationsQuery(true)
    const unreadCount = unreadNotifications.length

    useEffect(() => {
        if (!notificationsOpen) return

        const handlePointerDown = (event: MouseEvent) => {
            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(event.target as Node)
            ) {
                setNotificationsOpen(false)
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setNotificationsOpen(false)
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [notificationsOpen])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                setSearchOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

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
    const isChatRoute = location.pathname.startsWith('/chat')

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">

                <AppSidebar />

                <SidebarInset className="flex flex-1 flex-col bg-zinc-950 overflow-hidden">

                    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-800 bg-zinc-950 px-6">
                        <h1 className="shrink-0 text-sm font-semibold text-white capitalize">{title}</h1>

                        <SearchTrigger onClick={() => setSearchOpen((open) => !open)} className="mx-auto hidden sm:flex" />

                        <button
                            type="button"
                            onClick={() => setSearchOpen((open) => !open)}
                            aria-label={t('search.open')}
                            className="rounded-full border-none bg-transparent p-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white cursor-pointer sm:hidden"
                        >
                            <Search className="h-4 w-4" />
                        </button>

                        <div className="ml-auto flex items-center gap-3">
                            <HeaderClock userId={currentUser?.id} />

                            <div className="relative" ref={notificationsRef}>
                                <button
                                    className="relative rounded-full border-none bg-transparent p-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white cursor-pointer"
                                    type="button"
                                    aria-label="Open notifications"
                                    onClick={() => setNotificationsOpen((open) => !open)}
                                >
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-400 px-1 text-[10px] font-bold leading-none text-black">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <NotificationCenter
                                    open={notificationsOpen}
                                    onClose={() => setNotificationsOpen(false)}
                                />
                            </div>

                            <button
                                onClick={() => navigate("/profile")}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white select-none cursor-pointer border-none ${currentUser ? avatarColorFor(currentUser.id) : 'bg-purple-400'}`}
                            >
                                {initials}
                            </button>

                        </div>
                    </header>

                    <main className={`flex-1 bg-zinc-950 ${isChatRoute ? 'min-h-0 overflow-hidden' : 'overflow-y-auto'}`}>
                        <Outlet />
                    </main>

                </SidebarInset>

                <RealtimeNotificationPopup />
                <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
            </div>
        </SidebarProvider>
    )
}
