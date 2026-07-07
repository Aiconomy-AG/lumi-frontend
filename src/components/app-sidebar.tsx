import { useLocation, useNavigate } from "react-router"
import { Home, CheckSquare, ShoppingCart, MessageSquare, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

export const items = [
    { title: "Dashboard", path: "/dashboard", icon: Home },
    { title: "Tasks", path: "/tasks", icon: CheckSquare },
    { title: "Stock", path: "/dashboard", icon: ShoppingCart },
    { title: "Chat", path: "/dashboard", icon: MessageSquare },
    { title: "Admin", path: "/dashboard", icon: Users },
]

export function AppSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { open, toggleSidebar } = useSidebar()

    return (
        <Sidebar collapsible="icon" className="bg-zinc-950 border-r border-zinc-800 text-zinc-400">
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-400 text-black font-bold text-xs">
                        LU
                    </div>
                    {open && <span className="font-semibold text-white text-sm transition-opacity">Lumi</span>}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {items.map((item) => {
                                const isItemActive = location.pathname.startsWith(item.path)

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            onClick={() => navigate(item.path)}
                                            isActive={isItemActive}
                                            className={`w-full justify-start gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                                                isItemActive
                                                    ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/10 hover:text-purple-400"
                                                    : "hover:bg-zinc-900 hover:text-zinc-100"
                                            }`}
                                        >
                                            <item.icon className={`h-4 w-4 shrink-0 ${isItemActive ? "text-purple-400" : "text-zinc-400"}`} />
                                            {open && <span className="text-sm font-medium ml-3">{item.title}</span>}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 mt-auto">
                <button
                    onClick={toggleSidebar}
                    className="flex w-full items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-200 transition-colors rounded-md hover:bg-zinc-900 border-none cursor-pointer"
                    style={{ justifyContent: open ? 'flex-start' : 'center' }}
                >
                    {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    {open && <span className="text-xs font-medium">Collapse</span>}
                </button>
            </SidebarFooter>
        </Sidebar>
    )
}