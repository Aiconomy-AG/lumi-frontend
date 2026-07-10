import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Home, CheckSquare, ShoppingCart, MessageSquare, Users, ChevronLeft, ChevronRight, ClipboardList, FolderKanban, History } from "lucide-react"
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
import { useAuth } from "@/features/auth/AuthContext"
import { STATUS_TEXT_COLOR, type UserStatus } from "@/types/user"

export const items = [
    { titleKey: "sidebar.dashboard", path: "/dashboard", icon: Home },
    { titleKey: "sidebar.tasks", path: "/tasks", icon: CheckSquare },
    { titleKey: "sidebar.projects", path: "/projects", icon: FolderKanban },
    { titleKey: "sidebar.stock", path: "/stock", icon: ShoppingCart },
    { titleKey: "sidebar.orders", path: "/orders", icon: ClipboardList },
    { titleKey: "sidebar.chat", path: "/chat", icon: MessageSquare },
    { titleKey: "sidebar.admin", path: "/admin", icon: Users },
    { titleKey: "sidebar.auditLogs", path: "/admin/audit-logs", icon: History },
] as const

const languages = ["en", "ro", "de"] as const

export function AppSidebar() {
    const location = useLocation()
    const { open, toggleSidebar } = useSidebar()
    const { t, i18n } = useTranslation()
    const { isAdmin, user, updateStatus } = useAuth()

    function changeLanguage(lang: string) {
        i18n.changeLanguage(lang)
        localStorage.setItem("lang", lang)
    }

    function handleStatusChange(status: UserStatus) {
        void updateStatus(status)
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                                LU
                            </div>
                            <span className="text-sm font-semibold">{t('sidebar.brand')}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.filter((item) => isAdmin || !item.path.startsWith('/admin')).map((item) => {
                                const isItemActive =
                                    location.pathname === item.path ||
                                    (item.path !== '/admin' && location.pathname.startsWith(item.path + "/"))
                                const label = t(item.titleKey)

                                return (
                                    <SidebarMenuItem key={item.titleKey}>
                                        <SidebarMenuButton
                                            isActive={isItemActive}
                                            tooltip={label}
                                            render={<Link to={item.path} />}
                                        >
                                            <item.icon />
                                            <span>{label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="px-2 pb-2">
                    <div className="flex items-center gap-2 h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 focus-within:border-purple-500 transition-colors">
                        <span className={`h-2 w-2 shrink-0 rounded-full bg-current ${STATUS_TEXT_COLOR[user?.status ?? 'offline']}`} />
                        <select
                            value={user?.status === 'offline' ? 'available' : (user?.status ?? 'available')}
                            onChange={(e) => handleStatusChange(e.target.value as UserStatus)}
                            className={`w-full h-full bg-transparent text-xs font-medium capitalize outline-none cursor-pointer ${STATUS_TEXT_COLOR[user?.status ?? 'offline']}`}
                            aria-label={t('profile.status')}
                        >
                            <option value="available" className="bg-zinc-900 text-zinc-200">{t('userStatus.available')}</option>
                            <option value="busy" className="bg-zinc-900 text-zinc-200">{t('userStatus.busy')}</option>
                            <option value="away" className="bg-zinc-900 text-zinc-200">{t('userStatus.away')}</option>
                        </select>
                    </div>
                </div>
                <div className="flex group-data-[collapsible=icon]:flex-col justify-center items-center gap-1.5 px-2 pb-2">
                    {languages.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => changeLanguage(lang)}
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                                i18n.resolvedLanguage === lang
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-zinc-800 text-zinc-500 hover:bg-zinc-900"
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={toggleSidebar} tooltip={t('sidebar.expand')}>
                            {open ? <ChevronLeft /> : <ChevronRight />}
                            <span>{t('sidebar.collapse')}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
