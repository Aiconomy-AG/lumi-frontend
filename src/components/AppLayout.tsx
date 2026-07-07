import { Clock, Bell } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useTimeTracking } from "@/hooks/useTimeTracking"
import { mockUsers } from "@/api/mockData"
import { currentUserId } from "@/api/mockChat"

function formatTime(totalSeconds: number) {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
}

export default function AppLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { todaySeconds, isRunning } = useTimeTracking()
    const currentUser = mockUsers.find((u) => u.id === currentUserId)
    const initials = currentUser?.name.split(" ").map((w) => w[0]).join("").toUpperCase() ?? ""

    const getPageTitle = () => {
        const path = location.pathname
        if (path.startsWith('/tasks')) return 'Tasks'
        if (path.startsWith('/dashboard')) return 'Dashboard'
        if (path.startsWith('/stock')) return 'Stock'
        if (path.startsWith('/chat')) return 'Chat'
        if (path.startsWith('/admin')) return 'Admin'
        return 'Dashboard'
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
                            <div className="flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 bg-transparent">
                                <Clock className={`h-4 w-4 ${isRunning ? "text-purple-500" : "text-zinc-500"}`} />
                                {formatTime(todaySeconds)}
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