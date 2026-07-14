import {
  CheckSquare,
  FolderKanban,
  MessageSquare,
  Timer,
  UserCircle,
  UserPlus,
} from 'lucide-react'
import type { SearchAction } from './types'

export const searchActions: SearchAction[] = [
  {
    id: 'create-task',
    labelKey: 'search.actions.createTask',
    keywords: ['new', 'add', 'task'],
    icon: CheckSquare,
    run: ({ navigate }) => navigate('/tasks', { state: { openCreate: true } }),
  },
  {
    id: 'create-project',
    labelKey: 'search.actions.createProject',
    keywords: ['new', 'add', 'project'],
    icon: FolderKanban,
    run: ({ navigate }) => navigate('/projects', { state: { openCreate: true } }),
  },
  {
    id: 'open-chat',
    labelKey: 'search.actions.openChat',
    keywords: ['message', 'chat', 'dm'],
    icon: MessageSquare,
    run: ({ navigate }) => navigate('/chat'),
  },
  {
    id: 'open-profile',
    labelKey: 'search.actions.openProfile',
    keywords: ['profile', 'account', 'settings'],
    icon: UserCircle,
    run: ({ navigate }) => navigate('/profile'),
  },
  {
    id: 'message-user',
    labelKey: 'search.actions.messageUser',
    keywords: ['message', 'user', 'dm', 'chat'],
    icon: UserPlus,
    run: ({ navigate }) => navigate('/chat'),
  },
  {
    id: 'status-available',
    labelKey: 'search.actions.statusAvailable',
    keywords: ['status', 'available', 'online'],
    icon: UserCircle,
    run: ({ updateStatus }) => void updateStatus('available'),
  },
  {
    id: 'status-busy',
    labelKey: 'search.actions.statusBusy',
    keywords: ['status', 'busy', 'dnd'],
    icon: UserCircle,
    run: ({ updateStatus }) => void updateStatus('busy'),
  },
  {
    id: 'status-away',
    labelKey: 'search.actions.statusAway',
    keywords: ['status', 'away', 'afk'],
    icon: UserCircle,
    run: ({ updateStatus }) => void updateStatus('away'),
  },
]

export function getTimerActions(tasks: Array<{ id: number; title: string }>): SearchAction[] {
  return tasks.slice(0, 8).map((task) => ({
    id: `start-timer-${task.id}`,
    labelKey: 'search.actions.startTimerOn',
    labelValues: { task: task.title },
    keywords: ['timer', 'track', 'time', task.title.toLowerCase()],
    icon: Timer,
    run: ({ startTimer }) => void startTimer(task.id),
  }))
}

export function filterActions(
  actions: SearchAction[],
  query: string,
  ctx: Parameters<NonNullable<SearchAction['available']>>[0],
  matches: (value: string, query: string) => boolean,
  t: (key: string, options?: Record<string, unknown>) => string,
): SearchAction[] {
  const normalized = query.trim().toLowerCase()

  return actions.filter((action) => {
    if (action.available && !action.available(ctx)) {
      return false
    }

    if (!normalized) {
      return true
    }

    const label = t(action.labelKey, action.labelValues)

    const keywordMatch = action.keywords?.some((keyword) => matches(keyword, normalized)) ?? false

    return matches(label, normalized) || keywordMatch
  })
}
