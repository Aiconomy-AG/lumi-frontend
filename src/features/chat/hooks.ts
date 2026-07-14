import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveAiAction,
  createConversation,
  getConversations,
  getMessages,
  rejectAiAction,
  sendMessage,
  updateConversation,
} from '@/api/client'
import { connectEcho } from '@/lib/echo'
import type { AiActionMeta, Message } from '@/types/chat'
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

function patchMessageMeta(
  messages: Message[] | undefined,
  messageId: number,
  meta: AiActionMeta
): Message[] | undefined {
  if (!messages) {
    return messages
  }

  return messages.map((message) =>
    message.id === messageId ? { ...message, meta } : message
  )
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

    channel.listen('.ai-action.updated', (payload: { message_id: number; meta: AiActionMeta }) => {
      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) => patchMessageMeta(currentMessages, payload.message_id, payload.meta)
      )
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

export function useUpdateConversationMutation(conversationId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateConversation>[1]) =>
      updateConversation(conversationId!, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.conversations }),
  })
}

export function useSendMessageMutation(conversationId: number | null, currentUserId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => sendMessage(conversationId!, text),
    onMutate: async (text) => {
      if (conversationId === null) {
        return
      }

      await queryClient.cancelQueries({ queryKey: chatKeys.messages(conversationId) })

      const previousMessages = queryClient.getQueryData<Message[]>(chatKeys.messages(conversationId))
      const optimisticMessage: Message = {
        id: -Date.now(),
        conversation_id: conversationId,
        sender_id: currentUserId ?? 0,
        message: text,
        type: 'text',
        sent_at: new Date().toISOString(),
      }

      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) => upsertMessage(currentMessages, optimisticMessage)
      )

      return { optimisticMessage, previousMessages }
    },
    onSuccess: (message, _text, context) => {
      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) => {
          const withoutOptimisticMessage = currentMessages?.filter(
            (existingMessage) => existingMessage.id !== context?.optimisticMessage.id
          )
          return upsertMessage(withoutOptimisticMessage, message)
        }
      )
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    },
    onError: (_error, _text, context) => {
      if (conversationId === null) {
        return
      }

      queryClient.setQueryData(chatKeys.messages(conversationId), context?.previousMessages)
    },
  })
}

export function useApproveAiActionMutation(conversationId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (actionId: number) => approveAiAction(conversationId!, actionId),
    onMutate: async (actionId) => {
      if (conversationId === null) {
        return
      }

      await queryClient.cancelQueries({ queryKey: chatKeys.messages(conversationId) })
      const previousMessages = queryClient.getQueryData<Message[]>(chatKeys.messages(conversationId))

      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) =>
          currentMessages?.map((message) => {
            if (message.meta?.action_id !== actionId) {
              return message
            }

            return {
              ...message,
              meta: { ...message.meta, status: 'approved' as const },
            }
          })
      )

      return { previousMessages }
    },
    onError: (_error, _actionId, context) => {
      if (conversationId === null) {
        return
      }

      queryClient.setQueryData(chatKeys.messages(conversationId), context?.previousMessages)
    },
    onSettled: () => {
      if (conversationId === null) {
        return
      }

      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) })
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    },
  })
}

export function useRejectAiActionMutation(conversationId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (actionId: number) => rejectAiAction(conversationId!, actionId),
    onMutate: async (actionId) => {
      if (conversationId === null) {
        return
      }

      await queryClient.cancelQueries({ queryKey: chatKeys.messages(conversationId) })
      const previousMessages = queryClient.getQueryData<Message[]>(chatKeys.messages(conversationId))

      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) =>
          currentMessages?.map((message) => {
            if (message.meta?.action_id !== actionId) {
              return message
            }

            return {
              ...message,
              meta: { ...message.meta, status: 'rejected' as const },
            }
          })
      )

      return { previousMessages }
    },
    onError: (_error, _actionId, context) => {
      if (conversationId === null) {
        return
      }

      queryClient.setQueryData(chatKeys.messages(conversationId), context?.previousMessages)
    },
    onSettled: () => {
      if (conversationId === null) {
        return
      }

      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) })
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    },
  })
}
