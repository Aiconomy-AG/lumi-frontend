import type { Conversation, Message } from '../types/chat'
import { mockConversations, mockMessages } from './mockChat'
import { delay } from './http'

// chat e inca pe mock, nu exista tabele in backend
export async function getConversations(): Promise<Conversation[]> {
  return delay(mockConversations)
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  return delay(mockMessages.filter((m) => m.conversation_id === conversationId))
}

export async function sendMessage(conversationId: number, senderId: number, message: string): Promise<Message> {
  const newMessage: Message = {
    id: Date.now(),
    conversation_id: conversationId,
    sender_id: senderId,
    message,
    sent_at: new Date().toISOString(),
  }
  mockMessages.push(newMessage)
  return delay(newMessage)
}
