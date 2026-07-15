import { memo } from 'react'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Conversation } from '@/types/chat'
import type { User } from '@/types/user'
import {
    formatRelativeTime,
    getConversationTitle,
    getDirectParticipant,
    getGroupMemberPreview,
    getLastMessagePreview,
} from '../utils'
import { ChatAvatar, GroupAvatar } from './ChatAvatar'

interface ConversationRowProps {
    conversation: Conversation
    currentUserId?: number
    isActive: boolean
    onSelect: (conversation: Conversation) => void
}

export const ConversationRow = memo(function ConversationRow({ conversation, currentUserId, isActive, onSelect }: ConversationRowProps) {
    const { t, i18n } = useTranslation()
    const isGroup = conversation.type === 'group'
    const title = getConversationTitle(conversation, currentUserId)
    const directPerson = getDirectParticipant(conversation, currentUserId)
    const preview =
        getLastMessagePreview(conversation, conversation.participants, currentUserId, t('chat.you'), t('chat.photoMessage')) ??
        (isGroup ? t('chat.groupNoMessages') : directPerson?.role ?? t('chat.noMessages'))
    const sentAt = conversation.last_message?.sent_at ?? conversation.last_message_at

    return (
        <button
            type="button"
            onClick={() => onSelect(conversation)}
            className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors ${
                isActive ? 'bg-purple-500/20' : 'hover:bg-zinc-800/50'
            }`}
        >
            {isGroup ? (
                <GroupAvatar
                    participants={conversation.participants}
                    groupName={conversation.name}
                />
            ) : (
                <ChatAvatar user={directPerson} showStatus />
            )}

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-100">{title}</p>
                        {isGroup && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-300">
                                <Users className="h-2.5 w-2.5" />
                                {t('chat.groupBadge')}
                            </span>
                        )}
                    </div>
                    {sentAt && (
                        <span className="shrink-0 text-[11px] text-zinc-500">
                            {formatRelativeTime(sentAt, i18n.language, {
                                today: t('chat.today'),
                                yesterday: t('chat.yesterday'),
                            })}
                        </span>
                    )}
                </div>
                <p className="truncate text-xs text-zinc-400">{preview}</p>
                {isGroup && (
                    <p className="truncate text-[11px] text-zinc-500">
                        {getGroupMemberPreview(conversation.participants, currentUserId)}
                    </p>
                )}
            </div>
        </button>
    )
})

interface PeopleRowProps {
    person: User
    isActive: boolean
    onSelect: (person: User) => void
    disabled?: boolean
}

export const PeopleRow = memo(function PeopleRow({ person, isActive, onSelect, disabled }: PeopleRowProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(person)}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors disabled:opacity-50 ${
                isActive ? 'bg-purple-500/20' : 'hover:bg-zinc-800/50'
            }`}
        >
            <ChatAvatar user={person} showStatus />
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">{person.name}</p>
                <p className="truncate text-xs text-zinc-400">{person.role}</p>
            </div>
        </button>
    )
})
