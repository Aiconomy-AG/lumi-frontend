import type { User } from './user'

export interface Conversation {
    id: number
    type: 'direct' | 'group'
    name?: string
    created_by: number
    participants: User[]
}

export interface Message {
    id: number
    conversation_id: number
    sender_id: number
    message: string
    sent_at: string
}