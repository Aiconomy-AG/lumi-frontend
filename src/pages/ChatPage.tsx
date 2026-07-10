import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Conversation } from '@/types/chat'
import type { User, UserStatus } from '@/types/user'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    useConversationsQuery,
    useCreateConversationMutation,
    useConversationMessagesRealtime,
    useMessagesQuery,
    useSendMessageMutation,
} from '@/features/chat'
import { useUsersQuery } from '@/features/users'

import { useAuth} from '@/features/auth/AuthContext'
function otherParticipant(conversation: Conversation, currentUserId?: number) {
    return conversation.participants.find((p) => p.id !== currentUserId) ?? conversation.participants[0]
}


const avatarColors = [
    'bg-sky-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
]

function avatarColorFor(id: number) {
    return avatarColors[id % avatarColors.length]
}

const statusDotColors: Record<UserStatus, string> = {
    available: 'bg-green-500',
    busy: 'bg-red-500',
    away: 'bg-amber-400',
    offline: 'bg-zinc-500',
}

export default function ChatPage() {
    const { user } = useAuth();

    const { t } = useTranslation()
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [draft, setDraft] = useState('')

    const { data: conversations = [] } = useConversationsQuery()
    const { data: users = [] } = useUsersQuery()

    const lastTalkedByUserId = new Map<number, string>()
    for (const conversation of conversations) {
        if (conversation.type !== 'direct' || !conversation.last_message_at) continue
        const other = otherParticipant(conversation, user?.id)
        const current = lastTalkedByUserId.get(other.id)
        if (!current || conversation.last_message_at > current) {
            lastTalkedByUserId.set(other.id, conversation.last_message_at)
        }
    }

    const people = users
        .filter((u) => u.is_active && u.id !== user?.id)
        .sort((a, b) => {
            const lastA = lastTalkedByUserId.get(a.id)
            const lastB = lastTalkedByUserId.get(b.id)
            if (lastA && lastB) return lastB.localeCompare(lastA)
            if (lastA) return -1
            if (lastB) return 1
            return a.name.localeCompare(b.name)
        })

    const activeId = selectedId ?? conversations[0]?.id ?? null

    const { data: messages = [] } = useMessagesQuery(activeId)
    useConversationMessagesRealtime(activeId)

    const selectedConversation = conversations.find((c) => c.id === activeId)
    const selectedPerson = selectedConversation && otherParticipant(selectedConversation, user?.id)

    const sendMutation = useSendMessageMutation(activeId, user?.id)
    const createMutation = useCreateConversationMutation()

    async function openConversationWith(person: User) {
        const existing = conversations.find(
            (c) => c.type === 'direct' && c.participants.some((p) => p.id === person.id)
        )
        if (existing) {
            setSelectedId(existing.id)
            return
        }
        const conversation = await createMutation.mutateAsync({
            type: 'direct',
            participants_employee_ids: [person.id],
        })
        setSelectedId(conversation.id)
    }

    async function handleSend() {
        const text = draft.trim()
        if (text === '' || activeId === null) return
        setDraft('')
        await sendMutation.mutateAsync(text)
    }

    return (
        <div className="flex h-screen">
            <div className="w-72 border-r p-3">
                <Input placeholder={t('chat.searchPlaceholder')} className="mb-3" />
                <div className="space-y-1">
                    {people.map((person) => {
                        return (
                            <button
                                key={person.id}
                                onClick={() => void openConversationWith(person)}
                                disabled={createMutation.isPending}
                                className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors ${
                                    person.id === selectedPerson?.id ? 'bg-purple-500/20' : 'hover:bg-zinc-800/50'
                                }`}
                            >
                                <div className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColorFor(person.id)}`}>
                                    {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 ${statusDotColors[person.status]}`} />

                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-100">{person.name}</p>
                                    <p className="text-xs text-zinc-400">{person.role}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-1 flex-col">
                {selectedPerson && (
                    <div className="border-b p-4">
                        <p className="font-medium">{selectedPerson.name}</p>
                        <p className="text-xs text-slate-500">
                            {t(`userStatus.${selectedPerson.status}`)} · {selectedPerson.role}
                        </p>
                    </div>
                )}

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {messages.map((msg) => {
                        const fromMe = msg.sender_id === user?.id
                        return (
                            <div key={msg.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                                        fromMe ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-900'
                                    }`}
                                >
                                    {msg.message}
                                    <span className={`ml-2 text-xs ${fromMe ? 'text-purple-100' : 'text-slate-400'}`}>
                    {new Date(msg.sent_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="border-t border-zinc-800 p-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={selectedPerson ? t('chat.messagePlaceholder', { name: selectedPerson.name }) : t('chat.messagePlaceholderDefault')}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') void handleSend()
                            }}
                            disabled={activeId === null}
                            className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
                        />
                        <Button
                            type="button"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-full"
                            onClick={() => void handleSend()}
                            disabled={draft.trim() === '' || activeId === null || sendMutation.isPending}
                            aria-label={t('chat.send')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
