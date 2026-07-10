import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, MessageSquare, CheckSquare, FolderKanban, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { connectEcho } from '@/lib/echo'
import { cn } from '@/lib/utils'
import type { NotificationDelivery } from '@/types/notification'
import {
  getNotificationDisplay,
  getNotificationTarget,
  invalidateNotificationTargets,
  shouldShowRealtimeNotification,
} from './realtime'

interface ToastNotification {
  id: number
  notification: NotificationDelivery
}

const TOAST_LIFETIME_MS = 6000

export function RealtimeNotificationPopup() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pathnameRef = useRef(location.pathname)
  const [notifications, setNotifications] = useState<ToastNotification[]>([])

  useEffect(() => {
    pathnameRef.current = location.pathname
  }, [location.pathname])

  const dismissNotification = useCallback((id: number) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== id)
    )
  }, [])

  const addNotification = useCallback((notification: NotificationDelivery) => {
    setNotifications((currentNotifications) => [
      { id: notification.id, notification },
      ...currentNotifications.filter((item) => item.id !== notification.id),
    ].slice(0, 3))
  }, [])

  useEffect(() => {
    if (!user?.id) {
      return
    }

    const echo = connectEcho()

    if (!echo) {
      return
    }

    const channelName = `users.${user.id}`
    const channel = echo.private(channelName)

    channel.listen('.notification.delivered', (notification: NotificationDelivery) => {
      invalidateNotificationTargets(queryClient, notification)

      if (shouldShowRealtimeNotification(notification, pathnameRef.current)) {
        addNotification(notification)
      }
    })

    return () => {
      echo.leave(channelName)
    }
  }, [addNotification, queryClient, user?.id])

  useEffect(() => {
    if (notifications.length === 0) {
      return
    }

    const timers = notifications.map((notification) =>
      window.setTimeout(() => dismissNotification(notification.id), TOAST_LIFETIME_MS)
    )

    return () => {
      timers.forEach(window.clearTimeout)
    }
  }, [dismissNotification, notifications])

  const renderedNotifications = useMemo(
    () =>
      notifications.map(({ id, notification }) => ({
        id,
        notification,
        display: getNotificationDisplay(notification),
        target: getNotificationTarget(notification),
      })),
    [notifications]
  )

  if (renderedNotifications.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-5 top-16 z-50 flex w-[min(360px,calc(100vw-24px))] flex-col gap-2">
      {renderedNotifications.map(({ id, notification, display, target }) => {
        const Icon = getNotificationIcon(notification.event.type)

        return (
          <div
            key={id}
            className={cn(
              'pointer-events-auto overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950/95 text-zinc-100 shadow-2xl shadow-black/35 backdrop-blur',
              target && 'cursor-pointer transition-colors hover:border-zinc-500 hover:bg-zinc-900/95'
            )}
            role="status"
            onClick={() => {
              if (target) {
                navigate(target)
                dismissNotification(id)
              }
            }}
          >
            <div className="flex gap-3 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{display.title}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-300">{display.body}</p>
              </div>
              <button
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent bg-transparent text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                type="button"
                aria-label="Dismiss notification"
                onClick={(event) => {
                  event.stopPropagation()
                  dismissNotification(id)
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getNotificationIcon(type: string) {
  if (type.startsWith('chat_')) {
    return MessageSquare
  }

  if (type.startsWith('task_')) {
    return CheckSquare
  }

  if (type.startsWith('project_')) {
    return FolderKanban
  }

  return Bell
}
