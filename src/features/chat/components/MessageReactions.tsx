import { memo, useEffect, useRef, useState } from 'react'
import { SmilePlus } from 'lucide-react'
import type { Message, MessageReaction } from '@/types/chat'

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']
export type MessageReactionAction = 'add' | 'remove'

interface MessageReactionBadgesProps {
    message: Message
    reactions: MessageReaction[]
    currentUserId?: number
    align: 'left' | 'right'
    onReact?: (message: Message, emoji: string, action: MessageReactionAction) => void
}

export const MessageReactionBadges = memo(function MessageReactionBadges({
    message,
    reactions,
    currentUserId,
    align,
    onReact,
}: MessageReactionBadgesProps) {
    if (reactions.length === 0) {
        return null
    }

    return (
        <div className={`mt-1.5 flex flex-wrap gap-1 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
            {reactions.map((reaction) => {
                const hasReacted = typeof currentUserId === 'number' && reaction.user_ids.includes(currentUserId)
                const count = reaction.count || reaction.user_ids.length

                return (
                    <button
                        key={reaction.emoji}
                        type="button"
                        aria-label={`Toggle ${reaction.emoji} reaction`}
                        onClick={() => onReact?.(message, reaction.emoji, hasReacted ? 'remove' : 'add')}
                        disabled={!onReact || message.id < 0}
                        className={`flex h-6 items-center gap-1 rounded-full border px-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            hasReacted
                                ? 'border-purple-500/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/20'
                                : 'border-zinc-700 bg-zinc-800/70 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                        }`}
                    >
                        <span>{reaction.emoji}</span>
                        <span className="text-[10px] font-semibold">{count}</span>
                    </button>
                )
            })}
        </div>
    )
})

interface MessageReactionPickerProps {
    message: Message
    fromMe: boolean
    onReact?: (message: Message, emoji: string, action: MessageReactionAction) => void
}

export const MessageReactionPicker = memo(function MessageReactionPicker({ message, fromMe, onReact }: MessageReactionPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pickerRef = useRef<HTMLDivElement>(null)
    const canReact = !!onReact && message.id > 0

    useEffect(() => {
        if (!isOpen) {
            return
        }

        function handlePointerDown(event: PointerEvent) {
            if (!pickerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen])

    if (!canReact) {
        return null
    }

    return (
        <div
            ref={pickerRef}
            className={`relative flex items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${
                fromMe ? 'flex-row-reverse' : 'flex-row'
            }`}
        >
            <button
                type="button"
                aria-label="React to message"
                onClick={() => setIsOpen((current) => !current)}
                className="rounded-full border border-zinc-800 bg-zinc-900/90 p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            >
                <SmilePlus className="h-4 w-4" />
            </button>

            {isOpen && (
                <div
                    className={`absolute bottom-full z-30 mb-1.5 flex gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1 shadow-xl ${
                        fromMe ? 'right-0' : 'left-0'
                    }`}
                >
                    {EMOJI_OPTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            aria-label={`React with ${emoji}`}
                            onClick={() => {
                                onReact?.(message, emoji, 'add')
                                setIsOpen(false)
                            }}
                            className="rounded-full p-0.5 text-base transition-transform duration-100 hover:scale-125"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
})
