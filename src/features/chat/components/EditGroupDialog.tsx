import { useEffect, useMemo, useState } from 'react'
import { UserMinus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Conversation } from '@/types/chat'
import type { User } from '@/types/user'
import { personMatchesSearch } from '../utils'
import { ChatAvatar } from './ChatAvatar'

interface EditGroupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    conversation: Conversation | null
    currentUserId?: number
    users: User[]
    isSubmitting: boolean
    onSave: (payload: {
        name: string
        add_participants_employee_ids: number[]
        remove_participants_employee_ids: number[]
    }) => Promise<void>
}

export function EditGroupDialog({
    open,
    onOpenChange,
    conversation,
    currentUserId,
    users,
    isSubmitting,
    onSave,
}: EditGroupDialogProps) {
    const { t } = useTranslation()
    const [name, setName] = useState('')
    const [search, setSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [removedIds, setRemovedIds] = useState<number[]>([])

    const memberIds = useMemo(
        () => new Set(conversation?.participants.map((participant) => participant.id) ?? []),
        [conversation]
    )

    const currentMembers = useMemo(() => {
        return (
            conversation?.participants
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name)) ?? []
        )
    }, [conversation])

    const availableUsers = useMemo(
        () => users.filter((user) => user.is_active && !memberIds.has(user.id)),
        [users, memberIds]
    )

    const filteredUsers = useMemo(
        () => availableUsers.filter((user) => personMatchesSearch(user, search)),
        [availableUsers, search]
    )

    const remainingAfterRemoval = (conversation?.participants.length ?? 0) - removedIds.length + selectedIds.length
    const canRemoveMember = (memberId: number) => {
        if (memberId === currentUserId) return false
        return remainingAfterRemoval - 1 >= 2
    }

    useEffect(() => {
        if (!open || !conversation) return
        setName(conversation.name ?? '')
        setSearch('')
        setSelectedIds([])
        setRemovedIds([])
    }, [open, conversation])

    function toggleUser(userId: number) {
        setSelectedIds((current) =>
            current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
        )
    }

    function toggleRemoveMember(memberId: number) {
        setRemovedIds((current) =>
            current.includes(memberId)
                ? current.filter((id) => id !== memberId)
                : [...current, memberId]
        )
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        const trimmedName = name.trim()
        if (!trimmedName || !conversation || isSubmitting) return

        const nameChanged = trimmedName !== (conversation.name ?? '').trim()
        const hasNewMembers = selectedIds.length > 0
        const hasRemovedMembers = removedIds.length > 0

        if (!nameChanged && !hasNewMembers && !hasRemovedMembers) {
            onOpenChange(false)
            return
        }

        await onSave({
            name: trimmedName,
            add_participants_employee_ids: selectedIds,
            remove_participants_employee_ids: removedIds,
        })
        onOpenChange(false)
    }

    if (!conversation || conversation.type !== 'group') {
        return null
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('chat.editGroup')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400" htmlFor="edit-group-name">
                            {t('chat.groupName')}
                        </label>
                        <Input
                            id="edit-group-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder={t('chat.groupNamePlaceholder')}
                            maxLength={255}
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-zinc-400">{t('chat.currentMembers')}</p>
                        <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-zinc-800 p-2">
                            {currentMembers.map((member) => {
                                const isSelf = member.id === currentUserId
                                const isMarkedForRemoval = removedIds.includes(member.id)
                                const removable = canRemoveMember(member.id) || isMarkedForRemoval

                                return (
                                    <div
                                        key={member.id}
                                        className={`flex items-center gap-3 rounded-md p-2 ${
                                            isMarkedForRemoval ? 'bg-red-500/10 opacity-70' : ''
                                        }`}
                                    >
                                        <ChatAvatar user={member} showStatus className="h-8 w-8" />
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`truncate text-sm font-medium ${
                                                    isMarkedForRemoval ? 'line-through text-zinc-500' : ''
                                                }`}
                                            >
                                                {member.name}
                                                {isSelf ? ` (${t('chat.you')})` : ''}
                                            </p>
                                            <p className="truncate text-xs text-zinc-500">{member.role}</p>
                                        </div>
                                        {!isSelf && (
                                            <button
                                                type="button"
                                                onClick={() => toggleRemoveMember(member.id)}
                                                disabled={!removable}
                                                className={`rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                                    isMarkedForRemoval
                                                        ? 'text-amber-400 hover:bg-amber-500/10'
                                                        : 'text-zinc-500 hover:bg-red-500/10 hover:text-red-400'
                                                }`}
                                                aria-label={
                                                    isMarkedForRemoval
                                                        ? t('chat.undoRemoveMember', { name: member.name })
                                                        : t('chat.removeMember', { name: member.name })
                                                }
                                                title={
                                                    !removable
                                                        ? t('chat.cannotRemoveLastMembers')
                                                        : isMarkedForRemoval
                                                          ? t('chat.undoRemoveMember', { name: member.name })
                                                          : t('chat.removeMember', { name: member.name })
                                                }
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        {removedIds.length > 0 && (
                            <p className="text-xs text-amber-400">
                                {t('chat.membersMarkedForRemoval', { count: removedIds.length })}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400" htmlFor="edit-group-members">
                            {t('chat.addMembers')}
                        </label>
                        <Input
                            id="edit-group-members"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('chat.searchPlaceholder')}
                        />
                    </div>

                    <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-zinc-800 p-2">
                        {filteredUsers.length === 0 ? (
                            <p className="px-2 py-4 text-center text-sm text-zinc-500">
                                {availableUsers.length === 0 ? t('chat.allMembersAdded') : t('chat.noSearchResults')}
                            </p>
                        ) : (
                            filteredUsers.map((user) => {
                                const checked = selectedIds.includes(user.id)
                                return (
                                    <label
                                        key={user.id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-zinc-900 ${
                                            checked ? 'bg-purple-500/10' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleUser(user.id)}
                                            className="accent-purple-500"
                                        />
                                        <ChatAvatar user={user} showStatus className="h-8 w-8" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{user.name}</p>
                                            <p className="truncate text-xs text-zinc-500">{user.role}</p>
                                        </div>
                                    </label>
                                )
                            })
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            {t('chat.cancel')}
                        </Button>
                        <Button type="submit" disabled={!name.trim() || isSubmitting}>
                            {t('chat.saveGroup')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
