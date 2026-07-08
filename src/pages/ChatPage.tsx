import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getConversations, getMessages, sendMessage } from '@/api/client'
import { currentUserId } from '@/api/mockChat'
import type { Conversation } from '@/types/chat'
import { Input } from '@/components/ui/input'

function otherParticipant(conversation: Conversation) {
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

export default function ChatPage() {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [draft, setDraft] = useState('')

    const { data: conversations = [] } = useQuery({
        queryKey: ['conversations'],
        queryFn: getConversations,
    })

    const activeId = selectedId ?? conversations[0]?.id ?? null

    const { data: messages = [] } = useQuery({
        queryKey: ['messages', activeId],
        queryFn: () => getMessages(activeId!),
        enabled: activeId !== null,
    })

    const selectedConversation = conversations.find((c) => c.id === activeId)
    const selectedPerson = selectedConversation && otherParticipant(selectedConversation)

    const sendMutation = useMutation({
        mutationFn: (text: string) => sendMessage(activeId!, currentUserId, text),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', activeId] }),
    })

    async function handleSend() {
        const text = draft.trim()
        if (text === '' || activeId === null) return
        await sendMutation.mutateAsync(text)
        setDraft('')
    }

    return (
        <div className="flex h-screen">
            <div className="w-72 border-r p-3">
                <Input placeholder={t('chat.searchPlaceholder')} className="mb-3" />
                <div className="space-y-1">
                    {conversations.map((conversation) => {
                        const person = otherParticipant(conversation)
                        return (
                            <button
                                key={conversation.id}
                                onClick={() => setSelectedId(conversation.id)}
                                className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors ${
                                    conversation.id === activeId ? 'bg-purple-500/20' : 'hover:bg-zinc-800/50'
                                }`}
                            >
                                <div className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColorFor(person.id)}`}>
                                    {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                    {person.status === 'available' && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 bg-green-500" />
                                    )}
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
                        const fromMe = msg.sender_id === currentUserId
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
                        <button
                            type="button"
                            onClick={() => void handleSend()}
                            disabled={draft.trim() === '' || activeId === null || sendMutation.isPending}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label={t('chat.send')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}