import { useTranslation } from 'react-i18next'
import type { Message } from '@/types/chat'
import type { User } from '@/types/user'
import { formatMessageTime } from '../utils'
import { ChatAvatar } from './ChatAvatar'

interface MessageBubbleProps {
    message: Message
    fromMe: boolean
    sender?: User
    isGroup?: boolean
    showSenderName?: boolean
    showAvatar?: boolean
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

export function MessageBubble({
    message,
    fromMe,
    sender,
    isGroup = false,
    showSenderName = false,
    showAvatar = false,
}: MessageBubbleProps) {
    const { i18n } = useTranslation()

    return (
        <div className={`flex gap-2 ${fromMe ? 'justify-end' : 'justify-start'}`}>
            {!fromMe && isGroup ? (
                showAvatar ? (
                    <ChatAvatar user={sender} className="mt-5 h-7 w-7" />
                ) : (
                    <div className="w-7 shrink-0" />
                )
            ) : null}

            <div className={`max-w-[min(20rem,85%)] ${fromMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {showSenderName && sender && !fromMe && (
                    <span className={`mb-1 px-1 text-xs font-semibold ${senderTextColorFor(sender.id)}`}>
                        {sender.name}
                    </span>
                )}
                <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                        fromMe
                            ? 'rounded-br-md bg-purple-500 text-white'
                            : isGroup
                              ? 'rounded-bl-md border border-zinc-700/80 bg-zinc-800/90 text-zinc-100'
                              : 'rounded-bl-md bg-zinc-800 text-zinc-100'
                    }`}
                >
                    <p className="whitespace-pre-wrap break-words">{message.message}</p>
                    <span className={`mt-1 block text-right text-[11px] ${fromMe ? 'text-purple-100' : 'text-zinc-500'}`}>
                        {formatMessageTime(message.sent_at, i18n.language)}
                    </span>
                </div>
            </div>
        </div>
    )
}

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
