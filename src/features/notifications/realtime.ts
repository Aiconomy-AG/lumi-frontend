import type { QueryClient } from '@tanstack/react-query'
import { chatKeys } from '@/features/chat/queryKeys'
import { projectKeys } from '@/features/projects/queryKeys'
import { taskKeys } from '@/features/tasks/queryKeys'
import type { NotificationDelivery, NotificationEventPayload } from '@/types/notification'
import { notificationKeys } from './queryKeys'

const POPUP_TYPES = new Set([
  'chat_message_received',
  'task_assigned',
  'task_status_changed',
  'task_unassigned',
  'project_assigned',
  'project_member_added',
])

export function shouldShowRealtimeNotification(
  notification: NotificationDelivery,
  currentPathname: string
) {
  const type = notification.event.type

  if (!POPUP_TYPES.has(type)) {
    return false
  }

  return !(type === 'chat_message_received' && currentPathname.startsWith('/chat'))
}

export function invalidateNotificationTargets(
  queryClient: QueryClient,
  notification: NotificationDelivery
) {
  const type = notification.event.type

  void queryClient.invalidateQueries({ queryKey: notificationKeys.all })

  if (type.startsWith('chat_')) {
    void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    return
  }

  if (type.startsWith('task_')) {
    void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    return
  }

  if (type.startsWith('project_')) {
    void queryClient.invalidateQueries({ queryKey: projectKeys.all })
  }
}

export function getNotificationDisplay(notification: NotificationDelivery) {
  return {
    title: notification.title?.trim() || fallbackTitle(notification),
    body: notification.body?.trim() || fallbackBody(notification),
  }
}

export function getNotificationTarget(notification: NotificationDelivery) {
  const { event } = notification

  if (event.type.startsWith('chat_')) {
    return '/chat'
  }

  if (event.task_id) {
    return `/tasks/${event.task_id}`
  }

  if (event.project_id) {
    return `/projects/${event.project_id}`
  }

  if (event.type.startsWith('project_')) {
    return '/projects'
  }

  if (event.type.startsWith('task_')) {
    return '/tasks'
  }

  return null
}

function fallbackTitle(notification: NotificationDelivery) {
  switch (notification.event.type) {
    case 'chat_message_received':
      return 'New message'
    case 'task_assigned':
      return 'Task assigned'
    case 'task_status_changed':
      return 'Task updated'
    case 'task_unassigned':
      return 'Task unassigned'
    case 'project_assigned':
    case 'project_member_added':
      return 'Project assigned'
    default:
      return 'Notification'
  }
}

function fallbackBody(notification: NotificationDelivery) {
  const { event } = notification
  const payload = event.payload ?? {}

  switch (event.type) {
    case 'chat_message_received':
      return stringFromPayload(payload, 'message_preview') ?? 'You received a new message.'
    case 'task_assigned':
      return `You were assigned to ${quotedName(payload.task_title, 'a task')}.`
    case 'task_status_changed':
      return `Status changed on ${quotedName(payload.task_title, 'a task')}.`
    case 'task_unassigned':
      return `You were removed from ${quotedName(payload.task_title, 'a task')}.`
    case 'project_assigned':
    case 'project_member_added':
      return `You were assigned to ${quotedName(projectName(payload), 'a project')}.`
    default:
      return event.type.replace(/_/g, ' ')
  }
}

function stringFromPayload(payload: NotificationEventPayload, key: string) {
  const value = payload[key]
  return typeof value === 'string' && value.trim() ? value : null
}

function projectName(payload: NotificationEventPayload) {
  return stringFromPayload(payload, 'project_title') ?? stringFromPayload(payload, 'project_name')
}

function quotedName(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? `"${value}"` : fallback
}
