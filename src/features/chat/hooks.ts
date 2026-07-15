import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveAiAction,
  createConversation,
  getConversations,
  getMessages,
  reactToMessage,
  rejectAiAction,
  sendMessage,
  unreactToMessage,
  updateConversation,
} from '@/api/client'
import { connectEcho } from '@/lib/echo'
import type { AiActionMeta, Message } from '@/types/chat'
import type { MessageReactionAction } from './components/MessageReactions'
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

function removeUserFromReaction(message: Message, emoji: string, userId: number): Message {
  const reactions = message.reactions ?? []
  const existingReaction = reactions.find((reaction) => reaction.emoji === emoji)

  if (!existingReaction) {
    return message
  }

  const userIds = existingReaction.user_ids.filter((id) => id !== userId)
  const nextReactions = userIds.length === 0
    ? reactions.filter((reaction) => reaction.emoji !== emoji)
    : reactions.map((reaction) =>
        reaction.emoji === emoji
          ? { ...reaction, user_ids: userIds, count: userIds.length }
          : reaction
      )

  return {
    ...message,
    reactions: nextReactions,
  }
}

function addUserToReaction(message: Message, emoji: string, userId: number): Message {
  const reactions = message.reactions ?? []
  const existingReaction = reactions.find((reaction) => reaction.emoji === emoji)

  if (existingReaction) {
    const userIds = existingReaction.user_ids.includes(userId)
      ? existingReaction.user_ids
      : [...existingReaction.user_ids, userId]

    return {
      ...message,
      reactions: reactions.map((reaction) =>
        reaction.emoji === emoji
          ? { ...reaction, user_ids: userIds, count: userIds.length }
          : reaction
      ),
    }
  }

  return {
    ...message,
    reactions: [...reactions, { emoji, count: 1, user_ids: [userId] }],
  }
}

function patchMessageReaction(
  message: Message,
  emoji: string,
  userId: number,
  action: MessageReactionAction
): Message {
  if (action === 'remove') {
    return removeUserFromReaction(message, emoji, userId)
  }

  const withoutPreviousUserReactions = (message.reactions ?? []).reduce(
    (nextMessage, reaction) => removeUserFromReaction(nextMessage, reaction.emoji, userId),
    message
  )

  return addUserToReaction(withoutPreviousUserReactions, emoji, userId)
}

function patchReactionInMessages(
  messages: Message[] | undefined,
  messageId: number,
  emoji: string,
  userId: number,
  action: MessageReactionAction
) {
  return messages?.map((message) =>
    message.id === messageId ? patchMessageReaction(message, emoji, userId, action) : message
  )
}

function normalizeMessageReactionsForUser(message: Message, userId?: number, preferredEmoji?: string): Message {
  if (typeof userId !== 'number' || !message.reactions || message.reactions.length <= 1) {
    return message
  }

  const userReactionEmojis = message.reactions
    .filter((reaction) => reaction.user_ids.includes(userId))
    .map((reaction) => reaction.emoji)

  if (userReactionEmojis.length <= 1) {
    return message
  }

  const keptEmoji = preferredEmoji && userReactionEmojis.includes(preferredEmoji)
    ? preferredEmoji
    : userReactionEmojis[0]

  return {
    ...message,
    reactions: message.reactions
      .map((reaction) => {
        if (reaction.emoji === keptEmoji || !reaction.user_ids.includes(userId)) {
          return reaction
        }

        const userIds = reaction.user_ids.filter((reactionUserId) => reactionUserId !== userId)

        return {
          ...reaction,
          user_ids: userIds,
          count: userIds.length,
        }
      })
      .filter((reaction) => reaction.count > 0),
  }
}

function normalizeMessagesReactionsForUser(messages: Message[], userId?: number) {
  return messages.map((message) => normalizeMessageReactionsForUser(message, userId))
}

export function useConversationsQuery() {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: getConversations,
  })
}

export function useMessagesQuery(conversationId: number | null, currentUserId?: number) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async () => normalizeMessagesReactionsForUser(await getMessages(conversationId!), currentUserId),
    enabled: conversationId !== null,
  })
}

export function useConversationMessagesRealtime(conversationId: number | null, currentUserId?: number) {
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
        (currentMessages) => upsertMessage(currentMessages, normalizeMessageReactionsForUser(message, currentUserId))
      )
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    })

    channel.listen('.message.reaction.updated', (message: Message) => {
      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) => upsertMessage(currentMessages, normalizeMessageReactionsForUser(message, currentUserId))
      )
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
  }, [conversationId, currentUserId, queryClient])
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
        reactions: [],
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
          return upsertMessage(withoutOptimisticMessage, normalizeMessageReactionsForUser(message, currentUserId))
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

export function useToggleMessageReactionMutation(conversationId: number | null, currentUserId?: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ message, emoji, action }: { message: Message; emoji: string; action: MessageReactionAction }) => {
      if (conversationId === null || typeof currentUserId !== 'number') {
        throw new Error('Cannot react without an active conversation and user.')
      }

      if (action === 'remove') {
        return unreactToMessage(conversationId, message.id, emoji)
      }

      const currentMessage =
        queryClient.getQueryData<Message[]>(chatKeys.messages(conversationId))
          ?.find((cachedMessage) => cachedMessage.id === message.id) ?? message
      const existingUserEmojis = (currentMessage.reactions ?? [])
        .filter((reaction) => reaction.user_ids.includes(currentUserId))
        .map((reaction) => reaction.emoji)

      for (const existingEmoji of existingUserEmojis) {
        if (existingEmoji !== emoji) {
          await unreactToMessage(conversationId, message.id, existingEmoji)
        }
      }

      return reactToMessage(conversationId, message.id, emoji)
    },
    onMutate: async ({ message, emoji, action }) => {
      if (conversationId === null || typeof currentUserId !== 'number') {
        return
      }

      await queryClient.cancelQueries({ queryKey: chatKeys.messages(conversationId) })

      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) => patchReactionInMessages(currentMessages, message.id, emoji, currentUserId, action)
      )
    },
    onSuccess: (updatedMessage, { emoji }) => {
      if (conversationId === null || typeof currentUserId !== 'number') {
        return
      }

      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) =>
          upsertMessage(currentMessages, normalizeMessageReactionsForUser(updatedMessage, currentUserId, emoji))
      )
    },
    onError: (_error, { message, emoji, action }) => {
      if (conversationId === null || typeof currentUserId !== 'number') {
        return
      }

      queryClient.setQueryData<Message[] | undefined>(
        chatKeys.messages(conversationId),
        (currentMessages) => patchReactionInMessages(
          currentMessages,
          message.id,
          emoji,
          currentUserId,
          action === 'remove' ? 'add' : 'remove'
        )
      )
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
