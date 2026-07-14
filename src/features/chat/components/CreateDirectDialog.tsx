import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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

interface CreateDirectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    users: User[]
    currentUserId?: number
    isSubmitting: boolean
    onSelectPerson: (person: User) => void
}

export function CreateDirectDialog({
    open,
    onOpenChange,
    users,
    currentUserId,
    isSubmitting,
    onSelectPerson,
}: CreateDirectDialogProps) {
    const { t } = useTranslation()
    const [search, setSearch] = useState('')

    const availableUsers = useMemo(
        () => users.filter((user) => user.is_active && user.id !== currentUserId),
        [users, currentUserId]
    )

    const filteredUsers = useMemo(
        () => availableUsers.filter((user) => personMatchesSearch(user, search)),
        [availableUsers, search]
    )

    function resetForm() {
        setSearch('')
    }

    function handleSelect(user: User) {
        if (isSubmitting) return
        onSelectPerson(user)
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
                    <DialogTitle>{t('chat.newChat') || 'New Chat'}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Input
                            autoFocus
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('chat.searchPlaceholder') || 'Search...'}
                        />
                    </div>

                    <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-zinc-800 p-2">
                        {filteredUsers.length === 0 ? (
                            <p className="px-2 py-4 text-center text-sm text-zinc-500">{t('chat.noSearchResults') || 'No results'}</p>
                        ) : (
                            filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => handleSelect(user)}
                                    disabled={isSubmitting}
                                    className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-zinc-900 disabled:opacity-50"
                                >
                                    <ChatAvatar user={user} showStatus className="h-8 w-8" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{user.name}</p>
                                        <p className="truncate text-xs text-zinc-500">{user.role}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
