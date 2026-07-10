import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    dismissNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from '@/api/client'
import type { NotificationDelivery } from '@/types/notification'
import { notificationKeys } from './queryKeys'

export function useNotificationsQuery(unreadOnly = false) {
    return useQuery({
        queryKey: notificationKeys.list(unreadOnly),
        queryFn: () => getNotifications(unreadOnly),
    })
}

export function useMarkNotificationAsReadMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: (notification) => {
            queryClient.setQueriesData<NotificationDelivery[]>(
                { queryKey: notificationKeys.lists() },
                (currentNotifications) =>
                    currentNotifications?.map((item) =>
                        item.id === notification.id ? notification : item
                    )
            )
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        },
    })
}

export function useMarkAllNotificationsAsReadMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.setQueriesData<NotificationDelivery[]>(
                { queryKey: notificationKeys.lists() },
                (currentNotifications) =>
                    currentNotifications?.map((item) => ({
                        ...item,
                        read_at: item.read_at ?? new Date().toISOString(),
                    }))
            )
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        },
    })
}

export function useDismissNotificationMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: dismissNotification,
        onSuccess: (_data, notificationId) => {
            queryClient.setQueriesData<NotificationDelivery[]>(
                { queryKey: notificationKeys.lists() },
                (currentNotifications) =>
                    currentNotifications?.filter((notification) => notification.id !== notificationId)
            )

            void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        },
    })
}
