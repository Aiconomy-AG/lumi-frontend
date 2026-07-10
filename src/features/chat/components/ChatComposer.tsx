import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/types/chat'
import { getConversationTitle } from '../utils'

interface ChatComposerProps {
    conversation: Conversation | null
    currentUserId?: number
    draft: string
    onDraftChange: (value: string) => void
    onSend: () => void
    isSending: boolean
}

export function ChatComposer({ conversation, currentUserId, draft, onDraftChange, onSend, isSending }: ChatComposerProps) {
    const { t } = useTranslation()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
    }, [draft])

    const placeholder = conversation
        ? t('chat.messagePlaceholder', { name: getConversationTitle(conversation, currentUserId) })
        : t('chat.messagePlaceholderDefault')

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            if (draft.trim() && conversation && !isSending) {
                onSend()
            }
        }
    }

    return (
        <div className="border-t border-zinc-800 p-3">
            <div className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={placeholder}
                    value={draft}
                    onChange={(event) => onDraftChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!conversation || isSending}
                    className="max-h-40 min-h-10 flex-1 resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500/50 disabled:opacity-50"
                />
                <Button
                    type="button"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full"
                    onClick={onSend}
                    disabled={draft.trim() === '' || !conversation || isSending}
                    aria-label={t('chat.send')}
                >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
