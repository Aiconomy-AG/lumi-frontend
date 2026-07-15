import { ArrowLeft, Phone, Settings2, Users, Video } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Conversation } from '@/types/chat'
import type { User } from '@/types/user'
import { getConversationTitle, getDirectParticipant, getGroupMemberPreview } from '../utils'
import { ChatAvatar, GroupAvatar } from './ChatAvatar'
import { EditGroupDialog } from './EditGroupDialog'

interface ChatHeaderProps {
    conversation: Conversation | null
    currentUserId?: number
    users: User[]
    showBackButton?: boolean
    isUpdatingGroup?: boolean
    canDeleteGroup?: boolean
    isLeavingGroup?: boolean
    isDeletingGroup?: boolean
    onBack?: () => void
    onOpenProfile?: (userId: number) => void
    onStartCall?: (type: 'audio' | 'video') => void
    onUpdateGroup?: (payload: {
        name: string
        add_participants_employee_ids: number[]
        remove_participants_employee_ids: number[]
    }) => Promise<void>
    onLeaveGroup?: () => Promise<void>
    onDeleteGroup?: () => Promise<void>
}

export function ChatHeader({
    conversation,
    currentUserId,
    users,
    showBackButton,
    isUpdatingGroup = false,
    canDeleteGroup = false,
    isLeavingGroup = false,
    isDeletingGroup = false,
    onBack,
    onOpenProfile,
    onStartCall,
    onUpdateGroup,
    onLeaveGroup,
    onDeleteGroup,
}: ChatHeaderProps) {
    const { t } = useTranslation()
    const [editOpen, setEditOpen] = useState(false)

    if (!conversation) {
        return (
            <div className="flex h-16 items-center border-b border-zinc-800 px-4">
                {showBackButton && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="mr-3 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                        aria-label={t('chat.backToList')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                )}
                <p className="text-sm text-zinc-500">{t('chat.noConversationSelected')}</p>
            </div>
        )
    }

    const isGroup = conversation.type === 'group'
    const title = getConversationTitle(conversation, currentUserId)
    const directPerson = getDirectParticipant(conversation, currentUserId)
    const memberPreview = getGroupMemberPreview(conversation.participants, currentUserId)

    return (
        <>
            <div
                className={`flex items-center gap-3 border-b px-4 py-3 ${
                    isGroup ? 'border-violet-500/20 bg-violet-500/5' : 'border-zinc-800'
                }`}
            >
                {showBackButton && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                        aria-label={t('chat.backToList')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                )}

                {isGroup ? (
                    <GroupAvatar
                        participants={conversation.participants}
                        groupName={conversation.name}
                        className="h-11 w-11"
                    />
                ) : directPerson && onOpenProfile ? (
                    <button
                        type="button"
                        onClick={() => onOpenProfile(directPerson.id)}
                        aria-label={t('chat.viewProfile', { name: directPerson.name })}
                        className="shrink-0 rounded-full transition-opacity hover:opacity-80"
                    >
                        <ChatAvatar user={directPerson} showStatus className="h-10 w-10" />
                    </button>
                ) : (
                    <ChatAvatar user={directPerson} showStatus className="h-10 w-10" />
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate font-medium text-zinc-100">{title}</p>
                        {isGroup && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
                                <Users className="h-3 w-3" />
                                {t('chat.groupBadge')}
                            </span>
                        )}
                    </div>
                    {isGroup ? (
                        <p className="truncate text-xs text-zinc-400" title={memberPreview}>
                            {t('chat.membersCount', { count: conversation.participants.length })}
                            {memberPreview ? ` · ${memberPreview}` : ''}
                        </p>
                    ) : directPerson ? (
                        <p className="text-xs text-zinc-500">
                            {t(`userStatus.${directPerson.status}`)} · {directPerson.role}
                        </p>
                    ) : null}
                </div>

                {onStartCall && (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onStartCall('audio')}
                            className="cursor-pointer rounded-md p-2 text-purple-300 transition-colors hover:bg-purple-500/10 hover:text-purple-200"
                            aria-label="Start audio call"
                        >
                            <Phone className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onStartCall('video')}
                            className="cursor-pointer rounded-md p-2 text-purple-300 transition-colors hover:bg-purple-500/10 hover:text-purple-200"
                            aria-label="Start video call"
                        >
                            <Video className="h-4.5 w-4.5" />
                        </button>
                    </div>
                )}

                {isGroup && onUpdateGroup && (
                    <button
                        type="button"
                        onClick={() => setEditOpen(true)}
                        className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                        aria-label={t('chat.editGroup')}
                    >
                        <Settings2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isGroup && onUpdateGroup && (
                <EditGroupDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    conversation={conversation}
                    currentUserId={currentUserId}
                    users={users}
                    isSubmitting={isUpdatingGroup}
                    canDelete={canDeleteGroup}
                    isLeaving={isLeavingGroup}
                    isDeleting={isDeletingGroup}
                    onSave={onUpdateGroup}
                    onLeave={onLeaveGroup}
                    onDelete={onDeleteGroup}
                />
            )}
        </>
    )
}
