import { useEffect, useState } from 'react'
import { getConversations, getMessages, sendMessage } from '@/api/client'
import { currentUserId } from '@/api/mockChat'
import type { Conversation, Message } from '@/types/chat'
import { Input } from '@/components/ui/input'

function otherParticipant(conversation: Conversation) {
    return conversation.participants.find((p) => p.id !== currentUserId) ?? conversation.participants[0]
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [draft, setDraft] = useState('')

    useEffect(() => {
        getConversations().then((list) => {
            setConversations(list)
            if (list.length > 0) setSelectedId(list[0].id)
        })
    }, [])

    useEffect(() => {
        if (selectedId === null) return
        getMessages(selectedId).then(setMessages)
    }, [selectedId])

    const selectedConversation = conversations.find((c) => c.id === selectedId)
    const selectedPerson = selectedConversation && otherParticipant(selectedConversation)

    async function handleSend() {
        const text = draft.trim()
        if (text === '' || selectedId === null) return
        const sent = await sendMessage(selectedId, currentUserId, text)
        setMessages((prev) => [...prev, sent])
        setDraft('')
    }

    return (
        <div className="flex h-screen">
            <div className="w-72 border-r p-3">
                <Input placeholder="Search people..." className="mb-3" />
                <div className="space-y-1">
                    {conversations.map((conversation) => {
                        const person = otherParticipant(conversation)
                        return (
                            <button
                                key={conversation.id}
                                onClick={() => setSelectedId(conversation.id)}
                                className={`flex w-full items-center gap-3 rounded-md p-2 text-left ${
                                    conversation.id === selectedId ? 'bg-slate-100' : 'hover:bg-slate-50'
                                }`}
                            >
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-medium">
                                    {person.name.split(' ').map((n) => n[0]).join('')}
                                    {person.status === 'active' && (
                                        <span className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
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
                            {selectedPerson.status === 'active' ? 'Online' : 'Offline'} · {selectedPerson.role}
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
                        placeholder={selectedPerson ? `Message ${selectedPerson.name}...` : 'Message...'}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend()
                        }}
                    />
                </div>
            </div>
        </div>
    )
}