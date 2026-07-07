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
                                className={`flex w-full items-center gap-3 rounded-md p-2 text-left ${
                                    conversation.id === activeId ? 'bg-slate-100' : 'hover:bg-slate-50'
                                }`}
                            >
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-medium">
                                    {person.name.split(' ').map((n) => n[0]).join('')}
                                    {person.status === 'active' && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{person.name}</p>
                                    <p className="text-xs text-slate-500">{person.role}</p>
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
                            {selectedPerson.status === 'active' ? t('chat.online') : t('chat.offline')} · {selectedPerson.role}
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

                <div className="border-t p-3">
                    <Input
                        placeholder={selectedPerson ? t('chat.messagePlaceholder', { name: selectedPerson.name }) : t('chat.messagePlaceholderDefault')}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') void handleSend()
                        }}
                    />
                </div>
            </div>
        </div>
    )
}