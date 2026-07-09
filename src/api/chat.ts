import type { Conversation, Message } from '../types/chat'
import { requestData } from './http'

export async function getConversations(): Promise<Conversation[]> {
  return requestData<Conversation[]>('/v1/workspace/conversations')
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  return requestData<Message[]>(`/v1/workspace/conversations/${conversationId}/messages`)
}

export async function sendMessage(conversationId: number, message: string): Promise<Message> {
  return requestData<Message>(`/v1/workspace/conversations/${conversationId}/messages`, {
    method: 'POST',
    data: { message },
  })
}