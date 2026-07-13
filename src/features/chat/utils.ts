import type { Conversation } from '@/types/chat'
import type { User, UserStatus } from '@/types/user'

export const MESSAGE_MAX_LENGTH = 5000

export const avatarColors = [
    'bg-sky-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
]

export const statusDotColors: Record<UserStatus, string> = {
    available: 'bg-green-500',
    busy: 'bg-red-500',
    away: 'bg-amber-400',
    offline: 'bg-zinc-500',
}

export function avatarColorFor(id: number) {
    return avatarColors[id % avatarColors.length]
}

export function initialsFor(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

export function otherParticipant(conversation: Conversation, currentUserId?: number) {
    return conversation.participants.find((participant) => participant.id !== currentUserId) ?? conversation.participants[0]
}

export function getConversationTitle(conversation: Conversation, currentUserId?: number) {
    if (conversation.type === 'group') {
        return conversation.name?.trim() || 'Group'
    }

    return otherParticipant(conversation, currentUserId)?.name ?? 'Chat'
}

export function getGroupMemberPreview(participants: User[], currentUserId?: number, maxNames = 4) {
    const others = participants.filter((participant) => participant.id !== currentUserId)
    if (others.length === 0) return ''

    const shown = others.slice(0, maxNames).map((participant) => participant.name.split(' ')[0])
    const remaining = others.length - shown.length

    if (remaining > 0) {
        return `${shown.join(', ')} +${remaining}`
    }

    return shown.join(', ')
}

export function getLastMessagePreview(
    conversation: Conversation,
    participants: User[],
    currentUserId?: number,
    youLabel = 'You'
) {
    const lastMessage = conversation.last_message
    if (!lastMessage) return null

    if (conversation.type !== 'group') {
        return lastMessage.message
    }

    const sender = participants.find((participant) => participant.id === lastMessage.sender_id)
    const senderLabel =
        lastMessage.sender_id === currentUserId
            ? youLabel
            : sender?.name.split(' ')[0] ?? 'Someone'

    return `${senderLabel}: ${lastMessage.message}`
}

export function getDirectParticipant(conversation: Conversation, currentUserId?: number) {
    if (conversation.type !== 'direct') return null
    return otherParticipant(conversation, currentUserId)
}

export function matchesSearchQuery(value: string, query: string) {
    return value.toLowerCase().includes(query.toLowerCase())
}

export function conversationMatchesSearch(conversation: Conversation, query: string, currentUserId?: number) {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return true

    if (conversation.type === 'group') {
        return matchesSearchQuery(conversation.name ?? '', normalized)
    }

    const person = otherParticipant(conversation, currentUserId)
    if (!person) return false

    return (
        matchesSearchQuery(person.name, normalized) ||
        matchesSearchQuery(person.role, normalized) ||
        matchesSearchQuery(person.email, normalized)
    )
}

export function personMatchesSearch(person: User, query: string) {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return true

    return (
        matchesSearchQuery(person.name, normalized) ||
        matchesSearchQuery(person.role, normalized) ||
        matchesSearchQuery(person.email, normalized)
    )
}

export function formatMessageTime(sentAt: string, locale: string) {
    return new Date(sentAt).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatRelativeTime(sentAt: string, locale: string, labels: { today: string; yesterday: string }) {
    const date = new Date(sentAt)
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000)

    if (diffDays === 0) {
        return formatMessageTime(sentAt, locale)
    }

    if (diffDays === 1) {
        return labels.yesterday
    }

    if (diffDays < 7) {
        return date.toLocaleDateString(locale, { weekday: 'short' })
    }

    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

export function formatDateSeparator(sentAt: string, locale: string, labels: { today: string; yesterday: string }) {
    const date = new Date(sentAt)
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000)

    if (diffDays === 0) return labels.today
    if (diffDays === 1) return labels.yesterday

    return date.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
}

export function isSameDay(a: string, b: string) {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    )
}
