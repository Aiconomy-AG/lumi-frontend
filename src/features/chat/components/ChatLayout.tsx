import type { ReactNode } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface ChatLayoutProps {
    sidebar: ReactNode
    thread: ReactNode
    showSidebar: boolean
}

export function ChatLayout({ sidebar, thread, showSidebar }: ChatLayoutProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)')

    if (isDesktop) {
        return (
            <div className="flex h-full min-h-0">
                {sidebar}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">{thread}</div>
            </div>
        )
    }

    return (
        <div className="flex h-full min-h-0">
            {showSidebar ? sidebar : <div className="flex min-h-0 min-w-0 flex-1 flex-col">{thread}</div>}
        </div>
    )
}
