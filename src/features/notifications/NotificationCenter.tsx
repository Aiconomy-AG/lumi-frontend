import { Check, CheckSquare, FolderKanban, MessageSquare, Trash2, X } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NotificationDelivery } from '@/types/notification'
import {
    useDismissNotificationMutation,
    useMarkAllNotificationsAsReadMutation,
    useMarkNotificationAsReadMutation,
    useNotificationsQuery,
} from './hooks'
import {
    getChatSenderName,
    getNotificationCategory,
    getNotificationDisplay,
    getNotificationTarget,
} from './realtime'

interface NotificationCenterProps {
    open: boolean
    onClose: () => void
}

const PAGE_SIZE = 5

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
    const navigate = useNavigate()
    const { data: notifications = [], isLoading } = useNotificationsQuery()
    const markAsReadMutation = useMarkNotificationAsReadMutation()
    const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation()
    const dismissNotificationMutation = useDismissNotificationMutation()
    const [visibleChatCount, setVisibleChatCount] = useState(PAGE_SIZE)
    const [visibleWorkCount, setVisibleWorkCount] = useState(PAGE_SIZE)

    useEffect(() => {
        if (!open) return

        setVisibleChatCount(PAGE_SIZE)
        setVisibleWorkCount(PAGE_SIZE)
    }, [open])

    const chatNotifications = useMemo(
        () => notifications.filter((notification) => getNotificationCategory(notification) === 'chat'),
        [notifications]
    )

    const workNotifications = useMemo(
        () => notifications.filter((notification) => getNotificationCategory(notification) === 'work'),
        [notifications]
    )

    const unreadCount = notifications.filter((notification) => !notification.read_at).length

    if (!open) return null

    return (
        <div className="absolute right-0 top-10 z-50 w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <div>
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <p className="text-xs text-zinc-500">{unreadCount} unread</p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white disabled:opacity-40"
                        disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                        aria-label="Mark all as read"
                        onClick={() => markAllAsReadMutation.mutate()}
                    >
                        <Check className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                        aria-label="Close notifications"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
                {isLoading ? (
                    <div className="px-4 py-8 text-center text-sm text-zinc-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-zinc-500">No notifications</div>
                ) : (
                    <>
                        <NotificationSection
                            title="Chat"
                            emptyText="No chat notifications"
                            notifications={chatNotifications}
                            visibleCount={visibleChatCount}
                            onSeeMore={() => setVisibleChatCount((count) => count + PAGE_SIZE)}
                            onOpen={(notification) => {
                                const target = getNotificationTarget(notification)
                                if (!notification.read_at) markAsReadMutation.mutate(notification.id)
                                if (target) navigate(target)
                                onClose()
                            }}
                            onMarkRead={(notification) => markAsReadMutation.mutate(notification.id)}
                            onRemove={(notification) => dismissNotificationMutation.mutate(notification.id)}
                        />

                        <NotificationSection
                            title="Tasks & Projects"
                            emptyText="No task or project notifications"
                            notifications={workNotifications}
                            visibleCount={visibleWorkCount}
                            onSeeMore={() => setVisibleWorkCount((count) => count + PAGE_SIZE)}
                            onOpen={(notification) => {
                                const target = getNotificationTarget(notification)
                                if (!notification.read_at) markAsReadMutation.mutate(notification.id)
                                if (target) navigate(target)
                                onClose()
                            }}
                            onMarkRead={(notification) => markAsReadMutation.mutate(notification.id)}
                            onRemove={(notification) => dismissNotificationMutation.mutate(notification.id)}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

interface NotificationSectionProps {
    title: string
    emptyText: string
    notifications: NotificationDelivery[]
    visibleCount: number
    onSeeMore: () => void
    onOpen: (notification: NotificationDelivery) => void
    onMarkRead: (notification: NotificationDelivery) => void
    onRemove: (notification: NotificationDelivery) => void
}

function NotificationSection({
                                 title,
                                 emptyText,
                                 notifications,
                                 visibleCount,
                                 onSeeMore,
                                 onOpen,
                                 onMarkRead,
                                 onRemove,
                             }: NotificationSectionProps) {
    const visibleNotifications = notifications.slice(0, visibleCount)
    const hiddenCount = notifications.length - visibleNotifications.length

    return (
        <section className="border-b border-zinc-900 last:border-b-0">
            <div className="sticky top-0 bg-zinc-950/95 px-4 py-2 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
            </div>

            {notifications.length === 0 ? (
                <div className="px-4 py-4 text-sm text-zinc-600">{emptyText}</div>
            ) : (
                <>
                    <div className="divide-y divide-zinc-900">
                        {visibleNotifications.map((notification) => (
                            <NotificationRow
                                key={notification.id}
                                notification={notification}
                                onOpen={() => onOpen(notification)}
                                onMarkRead={() => onMarkRead(notification)}
                                onRemove={() => onRemove(notification)}
                            />
                        ))}
                    </div>

                    {hiddenCount > 0 && (
                        <button
                            type="button"
                            className="w-full border-t border-zinc-900 bg-transparent px-4 py-3 text-sm font-medium text-purple-300 transition-colors hover:bg-zinc-900 hover:text-purple-200"
                            onClick={onSeeMore}
                        >
                            See more ({hiddenCount})
                        </button>
                    )}
                </>
            )}
        </section>
    )
}

interface NotificationRowProps {
    notification: NotificationDelivery
    onOpen: () => void
    onMarkRead: () => void
    onRemove: () => void
}

function NotificationRow({ notification, onOpen, onMarkRead, onRemove }: NotificationRowProps) {
    const display = getNotificationDisplay(notification)
    const senderName = getChatSenderName(notification)
    const unread = !notification.read_at
    const Icon = getNotificationIcon(notification.event.type)

    return (
        <button
            type="button"
            className="flex w-full gap-3 bg-transparent px-4 py-3 text-left transition-colors hover:bg-zinc-900/70"
            onClick={onOpen}
        >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300">
                <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                        {display.title}
                    </p>
                    {unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-400" />}
                </div>

                {senderName && (
                    <p className="mt-1 truncate text-xs font-medium text-purple-300">
                        {senderName}
                    </p>
                )}
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">{display.body}</p>
                <p className="mt-2 text-xs text-zinc-600">{formatNotificationTime(notification.created_at)}</p>
            </div>

            <div className="flex shrink-0 items-start gap-1">
                {unread && (
                    <span
                        role="button"
                        tabIndex={0}
                        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                        onClick={(event) => {
                            event.stopPropagation()
                            onMarkRead()
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                event.stopPropagation()
                                onMarkRead()
                            }
                        }}
                    >
                        <Check className="h-4 w-4" />
                    </span>
                )}
                <span
                    role="button"
                    tabIndex={0}
                    className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-300"
                    onClick={(event) => {
                        event.stopPropagation()
                        onRemove()
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            onRemove()
                        }
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </span>
            </div>
        </button>
    )
}

function getNotificationIcon(type: string) {
    if (type.startsWith('chat_')) return MessageSquare
    if (type.startsWith('project_')) return FolderKanban
    if (type.startsWith('task_')) return CheckSquare
    return CheckSquare
}

function formatNotificationTime(value?: string | null) {
    if (!value) return ''

    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
    }).format(new Date(value))
}
