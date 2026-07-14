import type { User } from './user'

export interface LastMessage {
    message: string
    sender_id: number
    sent_at: string
}

export interface Conversation {
    id: number
    type: 'direct' | 'group'
    name?: string
    created_by: number
    participants: User[]
    last_message_at?: string | null
    last_message?: LastMessage | null
}

export interface Message {
    id: number
    conversation_id: number
    sender_id: number
    message: string
    type?: 'text' | 'ai_action'
    meta?: AiActionMeta
    sent_at: string
}

export type AiActionStatus =
    | 'pending'
    | 'approved'
    | 'executed'
    | 'failed'
    | 'rejected'
    | 'expired'

export interface AiActionMeta {
    action_id: number
    tool_name: string
    summary: string
    arguments: Record<string, unknown>
    status: AiActionStatus
    requested_by_user_id: number
    requested_by_name?: string
    expires_at: string
    result?: Record<string, unknown>
    error?: string
}
