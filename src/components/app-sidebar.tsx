import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
    Home,
    CheckSquare,
    ShoppingCart,
    MessageSquare,
    Users,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FolderKanban,
    History,
    Undo2,
    type LucideIcon,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/features/auth/AuthContext"
import type { UserStatus } from "@/types/user"

type NavItem = {
    titleKey: string
    path: string
    icon: LucideIcon
    adminOnly?: boolean
    staffOnly?: boolean
}

type NavGroup = {
    labelKey: string
    items: NavItem[]
}

export const navGroups: NavGroup[] = [
    {
        labelKey: "sidebar.groups.workspace",
        items: [
            { titleKey: "sidebar.dashboard", path: "/dashboard", icon: Home },
            { titleKey: "sidebar.tasks", path: "/tasks", icon: CheckSquare },
            { titleKey: "sidebar.projects", path: "/projects", icon: FolderKanban },
            { titleKey: "sidebar.chat", path: "/chat", icon: MessageSquare },
        ],
    },
    {
        labelKey: "sidebar.groups.sales",
        items: [
            { titleKey: "sidebar.stock", path: "/stock", icon: ShoppingCart },
            { titleKey: "sidebar.orders", path: "/orders", icon: ClipboardList, staffOnly: true },
            { titleKey: "sidebar.returns", path: "/returns", icon: Undo2, staffOnly: true },
        ],
    },
    {
        labelKey: "sidebar.groups.admin",
        items: [
            { titleKey: "sidebar.admin", path: "/admin", icon: Users, adminOnly: true },
            { titleKey: "sidebar.auditLogs", path: "/admin/audit-logs", icon: History, adminOnly: true },
        ],
    },
]

function canSeeNavItem(item: NavItem, isAdmin: boolean, role?: string): boolean {
    if (item.adminOnly) {
        return isAdmin
    }
    if (item.staffOnly) {
        return role !== "client"
    }
    return true
}

function isNavItemActive(path: string, pathname: string): boolean {
    return pathname === path || (path !== "/admin" && pathname.startsWith(path + "/"))
}

const languages = ["en", "ro", "de"] as const

export function AppSidebar() {
    const location = useLocation()
    const { open, toggleSidebar } = useSidebar()
    const { t, i18n } = useTranslation()
    const { isAdmin, user, updateStatus } = useAuth()

    const displayStatus: UserStatus =
        user?.status === "offline" ? "available" : (user?.status ?? "available")

    function changeLanguage(lang: string) {
        i18n.changeLanguage(lang)
        localStorage.setItem("lang", lang)
    }

    function handleStatusChange(status: UserStatus) {
        void updateStatus(status)
    }

    const visibleGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => canSeeNavItem(item, isAdmin, user?.role)),
        }))
        .filter((group) => group.items.length > 0)

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                                LU
                            </div>
                            <span className="text-sm font-semibold">{t("sidebar.brand")}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {visibleGroups.map((group, index) => (
                    <SidebarGroup key={group.labelKey}>
                        <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const label = t(item.titleKey)

                                    return (
                                        <SidebarMenuItem key={item.titleKey}>
                                            <SidebarMenuButton
                                                isActive={isNavItemActive(item.path, location.pathname)}
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
                        {index < visibleGroups.length - 1 && <SidebarSeparator className="mx-2" />}
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <div className="space-y-2 px-2 pb-2">
                    <Select
                        value={displayStatus}
                        onValueChange={(value) => value && handleStatusChange(value as UserStatus)}
                    >
                        <SelectTrigger className="h-8 w-full bg-sidebar text-xs" aria-label={t("profile.status")}>
                            <SelectValue>
                                {(value: UserStatus) => t(`userStatus.${value}`)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="available">{t("userStatus.available")}</SelectItem>
                            <SelectItem value="busy">{t("userStatus.busy")}</SelectItem>
                            <SelectItem value="away">{t("userStatus.away")}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={i18n.resolvedLanguage ?? "en"}
                        onValueChange={(value) => value && changeLanguage(value)}
                    >
                        <SelectTrigger className="h-8 w-full bg-sidebar text-xs" aria-label={t("sidebar.language")}>
                            <SelectValue>
                                {(value: string) => value.toUpperCase()}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                                <SelectItem key={lang} value={lang}>
                                    {lang.toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={toggleSidebar} tooltip={t("sidebar.expand")}>
                            {open ? <ChevronLeft /> : <ChevronRight />}
                            <span>{t("sidebar.collapse")}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
