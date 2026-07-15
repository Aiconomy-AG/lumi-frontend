import {
  CheckSquare,
  ClipboardList,
  FolderKanban,
  History,
  Home,
  MessageSquare,
  ShoppingCart,
  Undo2,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  titleKey: string
  path: string
  icon: LucideIcon
  adminOnly?: boolean
  staffOnly?: boolean
}

export type NavGroup = {
  labelKey: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    labelKey: 'sidebar.groups.workspace',
    items: [
      { titleKey: 'sidebar.dashboard', path: '/dashboard', icon: Home },
      { titleKey: 'sidebar.tasks', path: '/tasks', icon: CheckSquare },
      { titleKey: 'sidebar.projects', path: '/projects', icon: FolderKanban },
      { titleKey: 'sidebar.chat', path: '/chat', icon: MessageSquare },
    ],
  },
  {
    labelKey: 'sidebar.groups.sales',
    items: [
      { titleKey: 'sidebar.stock', path: '/stock', icon: ShoppingCart },
      { titleKey: "sidebar.stockLogs", path: "/stock-logs", icon: History, adminOnly: true },
      { titleKey: 'sidebar.orders', path: '/orders', icon: ClipboardList, staffOnly: true },
      { titleKey: 'sidebar.returns', path: '/returns', icon: Undo2, staffOnly: true },
    ],
  },
  {
    labelKey: 'sidebar.groups.admin',
    items: [
      { titleKey: 'sidebar.admin', path: '/admin', icon: Users, adminOnly: true },
      { titleKey: 'sidebar.auditLogs', path: '/admin/audit-logs', icon: History, adminOnly: true },
    ],
  },
]

export function canSeeNavItem(item: NavItem, isAdmin: boolean, role?: string): boolean {
  if (item.adminOnly) {
    return isAdmin
  }
  if (item.staffOnly) {
    return role !== 'client'
  }
  return true
}

export type FlatNavItem = {
  id: string
  titleKey: string
  path: string
  icon: LucideIcon
  groupKey: string
}

export function getVisibleNavItems(isAdmin: boolean, role?: string): FlatNavItem[] {
  return navGroups.flatMap((group) =>
    group.items
      .filter((item) => canSeeNavItem(item, isAdmin, role))
      .map((item) => ({
        id: `nav:${item.path}`,
        titleKey: item.titleKey,
        path: item.path,
        icon: item.icon,
        groupKey: group.labelKey,
      })),
  )
}