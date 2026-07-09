import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getConversations, getMessages, sendMessage } from '@/api/client'
import { chatKeys } from './queryKeys'


export function useConversationsQuery() {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: getConversations,
  })
}

export function useMessagesQuery(conversationId: number | null) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => getMessages(conversationId!),
    enabled: conversationId !== null,
  })
}

export function useSendMessageMutation(conversationId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => sendMessage(conversationId!, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) }),
  })
}
