import { request, requestData } from './http'
import type { NotificationDelivery } from '@/types/notification'

export async function getNotifications(unreadOnly = false): Promise<NotificationDelivery[]> {
    return requestData<NotificationDelivery[]>('/workspace/notifications', {
        params: unreadOnly ? { unreadOnly: true } : undefined,
    })
}

export async function markNotificationAsRead(notificationId: number): Promise<NotificationDelivery> {
    return requestData<NotificationDelivery>(`/workspace/notifications/${notificationId}/read`, {
        method: 'PUT',
    })
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await request('/workspace/notifications/read-all', {
        method: 'PUT',
    })
}

export async function dismissNotification(notificationId: number): Promise<void> {
    await request(`/workspace/notifications/${notificationId}`, {
        method: 'DELETE',
    })
}
