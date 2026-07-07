import { useNavigate, useLocation } from "react-router-dom"
import { Home, CheckSquare, ShoppingCart, MessageSquare, Users } from "lucide-react"
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
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <Sidebar className="custom-sidebar">
            <SidebarHeader className="sidebar-header">
                <div className="header-brand">
                    <div className="brand-logo">LU</div>
                    <span className="brand-name">Lumi</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="menu-list">
                            {items.map((item) => {
                                const isItemActive = location.pathname.startsWith(item.path)

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            className={`menu-button-base ${isItemActive ? "menu-button-active" : "menu-button-inactive"}`}
                                            onClick={() => navigate(item.path)}
                                        >
                                            <div className="menu-link" style={{ cursor: 'pointer' }}>
                                                <item.icon className={`menu-icon ${isItemActive ? "icon-active" : "icon-inactive"}`} />
                                                <span className="menu-text">{item.title}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="sidebar-footer">
                <span className="footer-text">Collapse</span>
            </SidebarFooter>
        </Sidebar>
    )
}