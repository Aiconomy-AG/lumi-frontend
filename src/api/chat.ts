import type { Conversation, Message } from '../types/chat'
import { requestData } from './http'

export async function getConversations(): Promise<Conversation[]> {
  return requestData<Conversation[]>('/workspace/conversations')
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  return requestData<Message[]>(`/workspace/conversations/${conversationId}/messages`)
}

export interface CreateConversationPayload {
  type: 'direct' | 'group'
  name?: string
  participants_employee_ids: number[]
}

export async function createConversation(payload: CreateConversationPayload): Promise<Conversation> {
  return requestData<Conversation>('/workspace/conversations', {
    method: 'POST',
    data: payload,
  })
}

export interface UpdateConversationPayload {
  name?: string
  add_participants_employee_ids?: number[]
  remove_participants_employee_ids?: number[]
}

export async function updateConversation(
  conversationId: number,
  payload: UpdateConversationPayload
): Promise<Conversation> {
  return requestData<Conversation>(`/workspace/conversations/${conversationId}`, {
    method: 'PUT',
    data: payload,
  })
}

export async function leaveConversation(conversationId: number): Promise<void> {
  await requestData(`/workspace/conversations/${conversationId}/leave`, {
    method: 'POST',
  })
}

export async function deleteConversation(conversationId: number): Promise<void> {
  await requestData(`/workspace/conversations/${conversationId}`, {
    method: 'DELETE',
  })
}

export async function sendMessage(conversationId: number, message: string): Promise<Message> {
  return requestData<Message>(`/workspace/conversations/${conversationId}/messages`, {
    method: 'POST',
    data: { message },
  })
}

export async function approveAiAction(conversationId: number, actionId: number): Promise<void> {
  await requestData(`/workspace/conversations/${conversationId}/ai-actions/${actionId}/approve`, {
    method: 'POST',
  })
}

export async function rejectAiAction(conversationId: number, actionId: number): Promise<void> {
  await requestData(`/workspace/conversations/${conversationId}/ai-actions/${actionId}/reject`, {
    method: 'POST',
  })
}