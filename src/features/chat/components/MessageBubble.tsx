import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Message } from '@/types/chat'
import type { User } from '@/types/user'
import { formatMessageTime } from '../utils'
import { AiActionCard } from './AiActionCard'
import { ChatAvatar } from './ChatAvatar'
import { MessageMarkdown } from './MessageMarkdown'
import {
    MessageReactionBadges,
    MessageReactionPicker,
    type MessageReactionAction,
} from './MessageReactions'

interface MessageBubbleProps {
    message: Message
    fromMe: boolean
    sender?: User
    isGroup?: boolean
    showSenderName?: boolean
    showAvatar?: boolean
    currentUserId?: number
    participantsById: ReadonlyMap<number, User>
    onReact?: (message: Message, emoji: string, action: MessageReactionAction) => void
}

const senderTextColors = [
    'text-sky-400',
    'text-violet-400',
    'text-emerald-400',
    'text-orange-400',
    'text-pink-400',
    'text-teal-400',
]

function senderTextColorFor(id: number) {
    return senderTextColors[id % senderTextColors.length]
}

export const MessageBubble = memo(function MessageBubble({
    message,
    fromMe,
    sender,
    isGroup = false,
    showSenderName = false,
    showAvatar = false,
    currentUserId,
    participantsById,
    onReact,
}: MessageBubbleProps) {
    const { i18n, t } = useTranslation()
    const isBot = sender?.is_bot === true
    const isAiAction = message.type === 'ai_action' && message.meta

    return (
        <div className={`group relative flex gap-2 ${fromMe ? 'justify-end' : 'justify-start'}`}>
            {!fromMe && (isGroup || isBot) ? (
                showAvatar || isBot ? (
                    <ChatAvatar user={sender} className="mt-5 h-7 w-7" />
                ) : (
                    <div className="w-7 shrink-0" />
                )
            ) : null}

            <div className={`flex flex-col ${fromMe ? 'items-end' : 'items-start'}`}>
                {(showSenderName || isBot) && sender && !fromMe && (
                    <span
                        className={`mb-1 flex items-center gap-1.5 px-1 text-xs font-semibold ${
                            isBot ? 'text-cyan-400' : senderTextColorFor(sender.id)
                        }`}
                    >
                        {sender.name}
                        {isBot && (
                            <span className="rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-cyan-300">
                                {t('chat.aiBadge')}
                            </span>
                        )}
                    </span>
                )}

                <div
                    className={`flex items-center gap-2 ${
                        isBot ? 'max-w-[min(36rem,92%)]' : 'max-w-[min(20rem,85%)]'
                    } ${fromMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                    <div
                        className={`rounded-2xl px-3 py-2 text-sm ${
                            fromMe
                                ? 'rounded-br-md bg-purple-500 text-white'
                                : isBot
                                    ? 'rounded-bl-md border border-cyan-500/30 bg-cyan-500/10 text-zinc-100'
                                    : isGroup
                                        ? 'rounded-bl-md border border-zinc-700/80 bg-zinc-800/90 text-zinc-100'
                                        : 'rounded-bl-md bg-zinc-800 text-zinc-100'
                        }`}
                    >
                        {isAiAction ? (
                            <AiActionCard
                                conversationId={message.conversation_id}
                                meta={message.meta!}
                                currentUserId={currentUserId}
                            />
                        ) : isBot ? (
                            <MessageMarkdown content={message.message} />
                        ) : (
                            <p className="whitespace-pre-wrap break-words">{message.message}</p>
                        )}
                        <span className={`mt-1 block text-right text-[11px] ${fromMe ? 'text-purple-100' : 'text-zinc-500'}`}>
                            {formatMessageTime(message.sent_at, i18n.language)}
                        </span>
                    </div>
                    <MessageReactionPicker message={message} fromMe={fromMe} onReact={onReact} />
                </div>

                <MessageReactionBadges
                    message={message}
                    reactions={message.reactions ?? []}
                    currentUserId={currentUserId}
                    participantsById={participantsById}
                    align={fromMe ? 'right' : 'left'}
                    onReact={onReact}
                />
            </div>
        </div>
    )
})

export function shouldShowGroupMessageMeta(
    messages: Message[],
    index: number,
    currentUserId?: number
) {
    const message = messages[index]
    const previous = messages[index - 1]
    const fromMe = message.sender_id === currentUserId

    if (fromMe) {
        return { showSenderName: false, showAvatar: false }
    }

    const sameSenderAsPrevious =
        previous &&
        previous.sender_id === message.sender_id &&
        Math.abs(new Date(message.sent_at).getTime() - new Date(previous.sent_at).getTime()) < 5 * 60_000

    return {
        showSenderName: !sameSenderAsPrevious,
        showAvatar: !sameSenderAsPrevious,
    }
}
