export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (unreadOnly = false) => [...notificationKeys.lists(), {unreadOnly}] as const
}
