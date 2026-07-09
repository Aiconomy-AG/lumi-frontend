import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createConversation, getConversations, getMessages, sendMessage } from '@/api/client'
import { connectEcho } from '@/lib/echo'
import type { Message } from '@/types/chat'
import { chatKeys } from './queryKeys'

function upsertMessage(messages: Message[] | undefined, incoming: Message): Message[] {
  const existing = messages ?? []
  const next = existing.some((message) => message.id === incoming.id)
    ? existing.map((message) => (message.id === incoming.id ? incoming : message))
    : [...existing, incoming]

  return next.sort((a, b) => {
    const sentAtDiff = new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
    return sentAtDiff === 0 ? a.id - b.id : sentAtDiff
  })
}

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

export function useConversationMessagesRealtime(conversationId: number | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (conversationId === null) {
      return
    }

    const echo = connectEcho()

    if (!echo) {
      return
    }

    const channelName = `conversations.${conversationId}`
    const channel = echo.private(channelName)

    channel.listen('.message.sent', (message: Message) => {
      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) => upsertMessage(currentMessages, message)
      )
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    })

    return () => {
      echo.leave(channelName)
    }
  }, [conversationId, queryClient])
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.conversations }),
  })
}

export function useSendMessageMutation(conversationId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => sendMessage(conversationId!, text),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) => upsertMessage(currentMessages, message)
      )
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    },
  })
}
