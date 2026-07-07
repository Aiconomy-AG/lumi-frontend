import { Link, useLocation } from "react-router-dom"
import { Home, CheckSquare, ShoppingCart, MessageSquare, Users, ChevronLeft, ChevronRight } from "lucide-react"
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
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"

export const items = [
    { title: "Dashboard", path: "/dashboard", icon: Home },
    { title: "Tasks", path: "/tasks", icon: CheckSquare },
    { title: "Stock", path: "/stock", icon: ShoppingCart },
    { title: "Chat", path: "/chat", icon: MessageSquare },
    { title: "Admin", path: "/admin", icon: Users },
]

export function AppSidebar() {
    const location = useLocation()
    const { open, toggleSidebar } = useSidebar()

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                                LU
                            </div>
                            <span className="text-sm font-semibold">Lumi</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isItemActive =
                                    location.pathname === item.path ||
                                    location.pathname.startsWith(item.path + "/")

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            isActive={isItemActive}
                                            tooltip={item.title}
                                            render={<Link to={item.path} />}
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={toggleSidebar} tooltip="Expand">
                            {open ? <ChevronLeft /> : <ChevronRight />}
                            <span>Collapse</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
