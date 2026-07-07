import { Clock, Bell } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Outlet, useLocation } from "react-router-dom" //

export default function AppLayout() {
    const location = useLocation()

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
                            <button className="flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900 transition-colors cursor-pointer bg-transparent">
                                <Clock className="h-4 w-4 text-orange-500" />
                                Start timer
                            </button>
                            <button className="rounded-full p-2 text-zinc-400 hover:bg-zinc-900 transition-colors cursor-pointer bg-transparent border-none">
                                <Bell className="h-4 w-4" />
                            </button>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-400 text-[10px] font-bold text-black select-none">
                                AP
                            </div>
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