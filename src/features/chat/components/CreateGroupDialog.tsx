import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { User } from '@/types/user'
import { personMatchesSearch } from '../utils'
import { ChatAvatar } from './ChatAvatar'

interface CreateGroupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    users: User[]
    currentUserId?: number
    isSubmitting: boolean
    onCreate: (payload: { name: string; participants_employee_ids: number[] }) => Promise<void>
}

export function CreateGroupDialog({
    open,
    onOpenChange,
    users,
    currentUserId,
    isSubmitting,
    onCreate,
}: CreateGroupDialogProps) {
    const { t } = useTranslation()
    const [name, setName] = useState('')
    const [search, setSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    const availableUsers = useMemo(
        () => users.filter((user) => user.is_active && user.id !== currentUserId),
        [users, currentUserId]
    )

    const filteredUsers = useMemo(
        () => availableUsers.filter((user) => personMatchesSearch(user, search)),
        [availableUsers, search]
    )

    function resetForm() {
        setName('')
        setSearch('')
        setSelectedIds([])
    }

    function toggleUser(userId: number) {
        setSelectedIds((current) =>
            current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
        )
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        const trimmedName = name.trim()
        if (!trimmedName || selectedIds.length === 0 || isSubmitting) return

        await onCreate({
            name: trimmedName,
            participants_employee_ids: selectedIds,
        })
        resetForm()
        onOpenChange(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) resetForm()
                onOpenChange(nextOpen)
            }}
        >
            <DialogContent className="max-h-[85vh] overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('chat.createGroup')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400" htmlFor="group-name">
                            {t('chat.groupName')}
                        </label>
                        <Input
                            id="group-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder={t('chat.groupNamePlaceholder')}
                            maxLength={255}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400" htmlFor="group-members">
                            {t('chat.selectMembers')}
                        </label>
                        <Input
                            id="group-members"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('chat.searchPlaceholder')}
                        />
                    </div>

                    <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-zinc-800 p-2">
                        {filteredUsers.length === 0 ? (
                            <p className="px-2 py-4 text-center text-sm text-zinc-500">{t('chat.noSearchResults')}</p>
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
                        <Button
                            type="submit"
                            disabled={!name.trim() || selectedIds.length === 0 || isSubmitting}
                        >
                            {t('chat.createGroup')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
