import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Conversation, Message } from '@/types/chat'
import { formatDateSeparator, isSameDay } from '../utils'
import { MessageBubble, shouldShowGroupMessageMeta } from './MessageBubble'

interface MessageListProps {
    conversation: Conversation | null
    messages: Message[]
    currentUserId?: number
    isLoading: boolean
    isError: boolean
    onRetry?: () => void
}

export function MessageList({
    conversation,
    messages,
    currentUserId,
    isLoading,
    isError,
    onRetry,
}: MessageListProps) {
    const { t, i18n } = useTranslation()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const previousLengthRef = useRef(messages.length)

    useEffect(() => {
        const container = scrollContainerRef.current
        const shouldForceScroll =
            messages.length !== previousLengthRef.current &&
            (!container || container.scrollHeight - container.scrollTop - container.clientHeight < 120)

        previousLengthRef.current = messages.length

        if (shouldForceScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages.length, conversation?.id])

    useEffect(() => {
        if (isLoading) return
        messagesEndRef.current?.scrollIntoView()
    }, [conversation?.id, isLoading])

    if (!conversation) {
        return (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-zinc-500">
                {t('chat.noConversationSelected')}
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                <Skeleton className="h-12 w-48 self-start rounded-2xl bg-zinc-800" />
                <Skeleton className="h-12 w-56 self-end rounded-2xl bg-zinc-800" />
                <Skeleton className="h-12 w-40 self-start rounded-2xl bg-zinc-800" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-zinc-400">{t('chat.loadingMessages')}</p>
                {onRetry && (
                    <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                        {t('chat.retry')}
                    </Button>
                )}
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-zinc-500">
                <p>{t('chat.noMessages')}</p>
                <p className="text-xs text-zinc-600">{t('chat.aiMentionHint')}</p>
            </div>
        )
    }

    const isGroup = conversation.type === 'group'
    const participantsById = new Map(conversation.participants.map((participant) => [participant.id, participant]))

    return (
        <div ref={scrollContainerRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => {
                const previous = messages[index - 1]
                const showDateSeparator = !previous || !isSameDay(previous.sent_at, message.sent_at)
                const fromMe = message.sender_id === currentUserId
                const sender = participantsById.get(message.sender_id)
                const groupMeta = isGroup ? shouldShowGroupMessageMeta(messages, index, currentUserId) : null

                return (
                    <div key={message.id} className="space-y-3">
                        {showDateSeparator && (
                            <div className="flex justify-center">
                                <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-500">
                                    {formatDateSeparator(message.sent_at, i18n.language, {
                                        today: t('chat.today'),
                                        yesterday: t('chat.yesterday'),
                                    })}
                                </span>
                            </div>
                        )}
                        <MessageBubble
                            message={message}
                            fromMe={fromMe}
                            sender={sender}
                            isGroup={isGroup}
                            showSenderName={groupMeta?.showSenderName ?? false}
                            showAvatar={groupMeta?.showAvatar ?? false}
                            currentUserId={currentUserId}
                        />
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>
    )
}
