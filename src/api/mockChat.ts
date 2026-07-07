import type { Conversation, Message } from '../types/chat'
import { mockUsers } from './mockData'

export const currentUserId = mockUsers[0].id

export const mockConversations: Conversation[] = mockUsers.slice(1).map((user, idx) => ({
    id: idx + 1,
    type: 'direct',
    created_by: currentUserId,
    participants: [mockUsers[0], user],
}))

export const mockMessages: Message[] = [
    { id: 1, conversation_id: 1, sender_id: mockUsers[1].id, message: 'Hey, did you push the latest changes?',    sent_at: '2026-07-07T09:14:00' },
    { id: 2, conversation_id: 1, sender_id: currentUserId,   message: 'Yeah, just pushed. Check branch feat/auth', sent_at: '2026-07-07T09:16:00' },
    { id: 3, conversation_id: 1, sender_id: mockUsers[1].id, message: "Nice, I'll review it this afternoon",       sent_at: '2026-07-07T09:17:00' },
    { id: 4, conversation_id: 3, sender_id: currentUserId,   message: "I'll take a look after standup",           sent_at: '2026-07-07T10:05:00' },
]