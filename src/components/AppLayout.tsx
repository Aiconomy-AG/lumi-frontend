import { NavLink, Outlet, useLocation } from 'react-router'
import { LayoutDashboard, CheckSquare, ShoppingCart, MessageSquare, Users, Clock, Bell } from 'lucide-react'

const navItems = [
    { to: '/',      label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks',     icon: CheckSquare },
    { to: '/stock', label: 'Stock',     icon: ShoppingCart },
    { to: '/chat',  label: 'Chat',      icon: MessageSquare },
    { to: '/admin', label: 'Admin',     icon: Users },
]

const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/tasks': 'Tasks',
    '/stock': 'Stock',
    '/chat': 'Chat',
    '/admin': 'Admin',
}

export default function AppLayout() {
    const location = useLocation()
    const title = titles[location.pathname] ?? ''

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <aside className="w-56 border-r p-4">
                <div className="mb-6 flex items-center gap-2 px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
                        W
                    </div>
                    <span className="font-semibold">WorkFlow</span>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                                        isActive
                                            ? 'bg-primary/10 font-medium text-primary'
                                            : 'text-muted-foreground hover:bg-muted'
                                    }`
                                }
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </NavLink>
                        )
                    })}
                </nav>
            </aside>

            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b px-6 py-3">
                    <h1 className="text-lg font-semibold">{title}</h1>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
                            <Clock className="h-4 w-4" />
                            Start timer
                        </button>
                        <button className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                            <Bell className="h-4 w-4" />
                        </button>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                            AP
                        </div>
                    </div>
                </header>

                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}