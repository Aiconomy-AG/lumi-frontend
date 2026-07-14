import { Plus, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Conversation } from '@/types/chat'
import type { User } from '@/types/user'
import { conversationMatchesSearch, getConversationTitle, getDirectParticipant, personMatchesSearch } from '../utils'
import { ConversationRow, PeopleRow } from './ConversationRow'
import { CreateGroupDialog } from './CreateGroupDialog'
import { CreateDirectDialog } from './CreateDirectDialog'

interface ChatSidebarProps {
    conversations: Conversation[]
    people: User[]
    currentUserId?: number
    activeConversationId: number | null
    isCreatingConversation: boolean
    onSelectConversation: (conversation: Conversation) => void
    onSelectPerson: (person: User) => void
    onCreateGroup: (payload: { name: string; participants_employee_ids: number[] }) => Promise<void>
}

export function ChatSidebar({
    conversations,
    people,
    currentUserId,
    activeConversationId,
    isCreatingConversation,
    onSelectConversation,
    onSelectPerson,
    onCreateGroup,
}: ChatSidebarProps) {
    const { t } = useTranslation()
    const [search, setSearch] = useState('')
    const [groupDialogOpen, setGroupDialogOpen] = useState(false)
    const [directDialogOpen, setDirectDialogOpen] = useState(false)

    const recentConversations = useMemo(() => {
        return conversations
            .filter(
                (conversation) =>
                    conversation.last_message_at ||
                    (activeConversationId !== null && conversation.id === activeConversationId)
            )
            .filter((conversation) => conversationMatchesSearch(conversation, search, currentUserId))
            .sort((a, b) => {
                const timeA = a.last_message_at ?? ''
                const timeB = b.last_message_at ?? ''
                if (timeA && timeB) return timeB.localeCompare(timeA)
                if (timeA) return -1
                if (timeB) return 1
                return getConversationTitle(a, currentUserId).localeCompare(getConversationTitle(b, currentUserId))
            })
    }, [conversations, search, currentUserId, activeConversationId])

    const peopleWithDirectConversations = useMemo(() => {
        return new Set(
            conversations
                .filter((conversation) => conversation.type === 'direct' && conversation.last_message_at)
                .map((conversation) => getDirectParticipant(conversation, currentUserId)?.id)
                .filter((id): id is number => typeof id === 'number')
        )
    }, [conversations, currentUserId])

    const activeDirectPersonId = useMemo(() => {
        if (!activeConversationId) return null
        const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId)
        if (!activeConversation || activeConversation.type !== 'direct') return null
        return getDirectParticipant(activeConversation, currentUserId)?.id ?? null
    }, [activeConversationId, conversations, currentUserId])

    const filteredPeople = useMemo(() => {
        return people
            .filter((person) => personMatchesSearch(person, search))
            .filter((person) => !peopleWithDirectConversations.has(person.id) && person.id !== activeDirectPersonId)
    }, [people, search, peopleWithDirectConversations, activeDirectPersonId])

    return (
        <>
            <div className="flex h-full min-h-0 w-full flex-col border-r border-zinc-800 md:w-80">
                <div className="space-y-3 border-b border-zinc-800 p-3">
                    <Input
                        placeholder={t('chat.searchPlaceholder')}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 justify-start gap-2 border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                            onClick={() => setDirectDialogOpen(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            {t('chat.newChat') || 'New Chat'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 justify-start gap-2 border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                            onClick={() => setGroupDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            {t('chat.newGroup')}
                        </Button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                    {recentConversations.length > 0 && (
                        <section className="mb-4">
                            <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                {t('chat.recent')}
                            </h2>
                            <div className="space-y-1">
                                {recentConversations.map((conversation) => (
                                    <ConversationRow
                                        key={conversation.id}
                                        conversation={conversation}
                                        currentUserId={currentUserId}
                                        isActive={conversation.id === activeConversationId}
                                        onSelect={onSelectConversation}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                            {t('chat.people')}
                        </h2>
                        <div className="space-y-1">
                            {filteredPeople.length === 0 ? (
                                <p className="px-2 py-6 text-center text-sm text-zinc-500">
                                    {search.trim() ? t('chat.noSearchResults') : t('chat.noPeople')}
                                </p>
                            ) : (
                                filteredPeople.map((person) => (
                                    <PeopleRow
                                        key={person.id}
                                        person={person}
                                        isActive={person.id === activeDirectPersonId}
                                        disabled={isCreatingConversation}
                                        onSelect={onSelectPerson}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <CreateGroupDialog
                open={groupDialogOpen}
                onOpenChange={setGroupDialogOpen}
                users={people}
                currentUserId={currentUserId}
                isSubmitting={isCreatingConversation}
                onCreate={onCreateGroup}
            />

            <CreateDirectDialog
                open={directDialogOpen}
                onOpenChange={setDirectDialogOpen}
                users={people}
                currentUserId={currentUserId}
                isSubmitting={isCreatingConversation}
                onSelectPerson={onSelectPerson}
            />
        </>
    )
}
