import { useEffect, useState } from 'react'
import { getPeople, getMessages, sendMessage } from '@/api/client'
import type { Person, Message } from '@/types/chat'
import { Input } from '@/components/ui/input'

export default function ChatPage() {
    const [people, setPeople] = useState<Person[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [draft, setDraft] = useState('')

    useEffect(() => {
        getPeople().then((list) => {
            setPeople(list)
            if (list.length > 0) setSelectedId(list[0].id)
        })
    }, [])

    useEffect(() => {
        if (selectedId === null) return
        getMessages(selectedId).then(setMessages)
    }, [selectedId])

    const selectedPerson = people.find((p) => p.id === selectedId)

    async function handleSend() {
        const text = draft.trim()
        if (text === '' || selectedId === null) return
        const sent = await sendMessage(selectedId, text)
        setMessages((prev) => [...prev, sent])   // adaugă mesajul nou la listă
        setDraft('')                             // golește câmpul
    }

    return (
        <div className="flex h-screen">
            {/* Coloana stângă: lista de persoane */}
            <div className="w-72 border-r p-3">
                <Input placeholder="Search people..." className="mb-3" />
                <div className="space-y-1">
                    {people.map((person) => (
                        <button
                            key={person.id}
                            onClick={() => setSelectedId(person.id)}
                            className={`flex w-full items-center gap-3 rounded-md p-2 text-left ${
                                person.id === selectedId ? 'bg-slate-100' : 'hover:bg-slate-50'
                            }`}
                        >
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-medium">
                                {person.name.split(' ').map((n) => n[0]).join('')}
                                {person.online && (
                                    <span className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{person.name}</p>
                                <p className="text-xs text-slate-500">{person.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Coloana dreaptă: conversația */}
            <div className="flex flex-1 flex-col">
                {selectedPerson && (
                    <div className="border-b p-4">
                        <p className="font-medium">{selectedPerson.name}</p>
                        <p className="text-xs text-slate-500">
                            {selectedPerson.online ? 'Online' : 'Offline'} · {selectedPerson.role}
                        </p>
                    </div>
                )}

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                                    msg.fromMe ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-900'
                                }`}
                            >
                                {msg.text}
                                <span className={`ml-2 text-xs ${msg.fromMe ? 'text-orange-100' : 'text-slate-400'}`}>
                  {msg.time}
                </span>
                            </div>
                        </div>
                    ))}
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