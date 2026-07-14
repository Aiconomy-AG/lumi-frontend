import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Message } from '@/types/chat'
import type { User } from '@/types/user'
import { formatMessageTime } from '../utils'
import { AiActionCard } from './AiActionCard'
import { ChatAvatar } from './ChatAvatar'
import { MessageMarkdown } from './MessageMarkdown'

// Define the reaction shape
export interface MessageReaction {
    emoji: string
    userIds: number[]
}

export type MessageWithReactions = Message & {
    reactions?: MessageReaction[]
}

interface MessageBubbleProps {
    message: MessageWithReactions
    fromMe: boolean
    sender?: User
    isGroup?: boolean
    showSenderName?: boolean
    showAvatar?: boolean
    currentUserId?: number
    onReact?: (messageId: number, emoji: string) => void
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

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

export const MessageBubble = memo(function MessageBubble({
                                                             message,
                                                             fromMe,
                                                             sender,
                                                             isGroup = false,
                                                             showSenderName = false,
                                                             showAvatar = false,
                                                             currentUserId,
                                                             onReact,
                                                         }: MessageBubbleProps) {
    const { i18n, t } = useTranslation()
    const [showPicker, setShowPicker] = useState(false)
    const isBot = sender?.is_bot === true
    const isAiAction = message.type === 'ai_action' && message.meta

    const reactions = message.reactions || []

    return (
        <div className={`group relative flex gap-2 ${fromMe ? 'justify-end' : 'justify-start'}`}>
            {!fromMe && (isGroup || isBot) ? (
                showAvatar || isBot ? (
                    <ChatAvatar user={sender} className="mt-5 h-7 w-7" />
                ) : (
                    <div className="w-7 shrink-0" />
                )
            ) : null}

            {/* This wraps the bubble and reactions to place the reaction trigger dynamically next to them */}
            <div
                className={`flex items-center gap-2 ${
                    isBot ? 'max-w-[min(36rem,92%)]' : 'max-w-[min(20rem,85%)]'
                } ${fromMe ? 'flex-row-reverse' : 'flex-row'}`}
            >

                {/* Bubble Container */}
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

                    {/* Display active reaction badges under the bubble */}
                    {reactions.length > 0 && (
                        <div className={`mt-1.5 flex flex-wrap gap-1 ${fromMe ? 'justify-end' : 'justify-start'}`}>
                            {reactions.map((reaction) => {
                                const hasReacted = currentUserId ? reaction.userIds.includes(currentUserId) : false
                                return (
                                    <button
                                        key={reaction.emoji}
                                        type="button"
                                        onClick={() => onReact?.(message.id, reaction.emoji)}
                                        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all ${
                                            hasReacted
                                                ? 'border-purple-500/40 bg-purple-500/15 text-purple-200'
                                                : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600'
                                        }`}
                                    >
                                        <span>{reaction.emoji}</span>
                                        <span className="text-[10px] font-semibold">{reaction.userIds.length}</span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Reaction Hover Trigger Panel */}
                <div
                    className={`relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${fromMe ? 'flex-row-reverse' : 'flex-row'}`}
                    onMouseLeave={() => setShowPicker(false)}
                >
                    <button
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className="rounded-full border border-zinc-800 bg-zinc-900/80 p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                        </svg>
                    </button>

                    {/* Emoji Select Tooltip Popup */}
                    {showPicker && (
                        <div className={`absolute bottom-full mb-1.5 z-30 flex gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150 ${fromMe ? 'right-0' : 'left-0'}`}>
                            {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                        onReact?.(message.id, emoji)
                                        setShowPicker(false)
                                    }}
                                    className="text-base hover:scale-125 hover:rotate-6 transition-transform duration-100 p-0.5"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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