import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Conversation } from '@/types/chat'
import type { User } from '@/types/user'
import { useAuth } from '@/features/auth/AuthContext'
import { useUsersQuery } from '@/features/users'
import {
    useConversationsQuery,
    useConversationMessagesRealtime,
    useCreateConversationMutation,
    useMessagesQuery,
    useSendMessageMutation,
    useUpdateConversationMutation,
} from '@/features/chat'
import { ChatComposer } from '@/features/chat/components/ChatComposer'
import { ChatHeader } from '@/features/chat/components/ChatHeader'
import { ChatLayout } from '@/features/chat/components/ChatLayout'
import { ChatSidebar } from '@/features/chat/components/ChatSidebar'
import { MessageList } from '@/features/chat/components/MessageList'
import { useMediaQuery } from '@/features/chat/hooks/useMediaQuery'
import { MESSAGE_MAX_LENGTH } from '@/features/chat/utils'

function parseConversationId(value?: string) {
    if (!value) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export default function ChatPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { conversationId: conversationIdParam } = useParams()
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [draft, setDraft] = useState('')
    const [mobileShowSidebar, setMobileShowSidebar] = useState(true)

    const activeConversationId = parseConversationId(conversationIdParam)

    const { data: conversations = [] } = useConversationsQuery()
    const { data: users = [] } = useUsersQuery()

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
        [conversations, activeConversationId]
    )

    const {
        data: messages = [],
        isLoading: isMessagesLoading,
        isError: isMessagesError,
        refetch: refetchMessages,
    } = useMessagesQuery(activeConversationId)

    useConversationMessagesRealtime(activeConversationId)

    const createMutation = useCreateConversationMutation()
    const updateMutation = useUpdateConversationMutation(activeConversationId)
    const sendMutation = useSendMessageMutation(activeConversationId, user?.id)

    const people = useMemo(
        () =>
            users
                .filter((candidate) => candidate.is_active && candidate.id !== user?.id)
                .sort((a, b) => a.name.localeCompare(b.name)),
        [users, user?.id]
    )

    useEffect(() => {
        if (!conversationIdParam) return
        const parsed = parseConversationId(conversationIdParam)
        if (!parsed) {
            navigate('/chat', { replace: true })
        }
    }, [conversationIdParam, navigate])

    useEffect(() => {
        if (!isDesktop && activeConversationId) {
            setMobileShowSidebar(false)
        }
    }, [activeConversationId, isDesktop])

    function openConversation(conversationId: number) {
        navigate(`/chat/${conversationId}`)
        if (!isDesktop) {
            setMobileShowSidebar(false)
        }
    }

    async function openConversationWith(person: User) {
        const existing = conversations.find(
            (conversation) =>
                conversation.type === 'direct' &&
                conversation.participants.some((participant) => participant.id === person.id)
        )

        if (existing) {
            openConversation(existing.id)
            return
        }

        const conversation = await createMutation.mutateAsync({
            type: 'direct',
            participants_employee_ids: [person.id],
        })
        openConversation(conversation.id)
    }

    async function handleCreateGroup(payload: { name: string; participants_employee_ids: number[] }) {
        const conversation = await createMutation.mutateAsync({
            type: 'group',
            name: payload.name,
            participants_employee_ids: payload.participants_employee_ids,
        })
        openConversation(conversation.id)
    }

    async function handleUpdateGroup(payload: {
        name: string
        add_participants_employee_ids: number[]
        remove_participants_employee_ids: number[]
    }) {
        if (!activeConversationId) return

        const updates: {
            name?: string
            add_participants_employee_ids?: number[]
            remove_participants_employee_ids?: number[]
        } = {}
        const currentName = activeConversation?.name ?? ''

        if (payload.name.trim() !== currentName.trim()) {
            updates.name = payload.name.trim()
        }

        if (payload.add_participants_employee_ids.length > 0) {
            updates.add_participants_employee_ids = payload.add_participants_employee_ids
        }

        if (payload.remove_participants_employee_ids.length > 0) {
            updates.remove_participants_employee_ids = payload.remove_participants_employee_ids
        }

        if (Object.keys(updates).length === 0) return

        await updateMutation.mutateAsync(updates)
    }

    async function handleSend() {
        const text = draft.trim()
        if (!text || activeConversationId === null || text.length > MESSAGE_MAX_LENGTH) return
        setDraft('')
        try {
            await sendMutation.mutateAsync(text)
        } catch {
            setDraft(text)
        }
    }

    function handleSelectConversation(conversation: Conversation) {
        openConversation(conversation.id)
    }

    function handleBackToList() {
        if (isDesktop) return
        setMobileShowSidebar(true)
        navigate('/chat')
    }

    const sidebar = (
        <ChatSidebar
            conversations={conversations}
            people={people}
            currentUserId={user?.id}
            activeConversationId={activeConversationId}
            isCreatingConversation={createMutation.isPending}
            onSelectConversation={handleSelectConversation}
            onSelectPerson={(person) => void openConversationWith(person)}
            onCreateGroup={handleCreateGroup}
        />
    )

    const thread = (
        <>
            <ChatHeader
                conversation={activeConversation}
                currentUserId={user?.id}
                users={users}
                showBackButton={!isDesktop && !mobileShowSidebar}
                isUpdatingGroup={updateMutation.isPending}
                onBack={handleBackToList}
                onUpdateGroup={activeConversation?.type === 'group' ? handleUpdateGroup : undefined}
            />
            <MessageList
                conversation={activeConversation}
                messages={messages}
                currentUserId={user?.id}
                isLoading={isMessagesLoading}
                isError={isMessagesError}
                onRetry={() => void refetchMessages()}
            />
            <ChatComposer
                conversation={activeConversation}
                currentUserId={user?.id}
                draft={draft}
                onDraftChange={setDraft}
                onSend={() => void handleSend()}
                isSending={sendMutation.isPending}
            />
        </>
    )

    return (
        <ChatLayout
            sidebar={sidebar}
            thread={thread}
            showSidebar={isDesktop || mobileShowSidebar}
        />
    )
}
