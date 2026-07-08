export const chatKeys = {
  conversations: ['conversations'] as const,
  messages: (conversationId: number | null) => ['messages', conversationId] as const,
}
