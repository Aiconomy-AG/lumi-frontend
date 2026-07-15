import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Conversation, Message } from '@/types/chat'
import type { User } from '@/types/user'
import { useAuth } from '@/features/auth/AuthContext'
import { useUsersQuery } from '@/features/users'
import {
    useConversationsQuery,
    useConversationMessagesRealtime,
    useCreateConversationMutation,
    useDeleteConversationMutation,
    useLeaveConversationMutation,
    useMessagesQuery,
    useSendMessageMutation,
    useToggleMessageReactionMutation,
    useUpdateConversationMutation,
} from '@/features/chat'
import { ChatComposer } from '@/features/chat/components/ChatComposer'
import { ChatHeader } from '@/features/chat/components/ChatHeader'
import { ChatLayout } from '@/features/chat/components/ChatLayout'
import { ChatSidebar } from '@/features/chat/components/ChatSidebar'
import { MessageList } from '@/features/chat/components/MessageList'
import type { MessageReactionAction } from '@/features/chat/components/MessageReactions'
import { UserProfileDialog } from '@/features/users/components/UserProfileDialog'
import { useProfileDialog } from '@/features/users/useProfileDialog'
import { useMediaQuery } from '@/features/chat/hooks/useMediaQuery'
import { canCallWorkspaceUser, getDirectParticipant, MESSAGE_MAX_LENGTH } from '@/features/chat/utils'
import { useCalls } from '@/features/calls'

function parseConversationId(value?: string) {
    if (!value) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export default function ChatPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const { start: startCall } = useCalls()
    const { conversationId: conversationIdParam } = useParams()
    const isDesktop = useMediaQuery('(min-width: 768px)')
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
    } = useMessagesQuery(activeConversationId, user?.id)

    useConversationMessagesRealtime(activeConversationId, user?.id)

    const createMutation = useCreateConversationMutation()
    const updateMutation = useUpdateConversationMutation(activeConversationId)
    const leaveMutation = useLeaveConversationMutation(activeConversationId)
    const deleteMutation = useDeleteConversationMutation(activeConversationId)
    const sendMutation = useSendMessageMutation(activeConversationId, user?.id)
    const reactionMutation = useToggleMessageReactionMutation(activeConversationId, user?.id)

    const canDeleteActiveGroup =
        activeConversation?.type === 'group' &&
        (user?.role === 'admin' || activeConversation.created_by === user?.id)

    const people = useMemo(
        () =>
            users
                .filter(
                    (candidate) =>
                        candidate.is_active && !candidate.is_bot && candidate.role !== 'client' && candidate.id !== user?.id
                )
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

    const profileCandidates = useMemo(
        () => [activeConversation?.participants ?? [], users],
        [activeConversation, users]
    )
    const { profileUser, openProfile, closeProfile } = useProfileDialog(profileCandidates)

    const userIdFromSearch = searchParams.get('user')

    useEffect(() => {
        if (!userIdFromSearch || people.length === 0) return

        const userId = Number(userIdFromSearch)
        if (!Number.isFinite(userId)) {
            const nextParams = new URLSearchParams(searchParams)
            nextParams.delete('user')
            setSearchParams(nextParams, { replace: true })
            return
        }

        const person = people.find((candidate) => candidate.id === userId)
        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('user')
        setSearchParams(nextParams, { replace: true })

        if (person) {
            void openConversationWith(person)
        }
    }, [userIdFromSearch, people, conversations, createMutation, isDesktop, navigate, searchParams, setSearchParams])

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

    async function handleSend(text: string, image?: File) {
        if ((!text && !image) || activeConversationId === null || text.length > MESSAGE_MAX_LENGTH) return false
        try {
            await sendMutation.mutateAsync({ text, image })
            return true
        } catch {
            return false
        }
    }

    function handleReact(message: Message, emoji: string, action: MessageReactionAction) {
        if (activeConversationId === null || !user?.id || message.id < 0) return
        reactionMutation.mutate({ message, emoji, action })
    }

    function handleSelectConversation(conversation: Conversation) {
        openConversation(conversation.id)
    }

    async function handleLeaveGroup() {
        if (!activeConversationId) return
        await leaveMutation.mutateAsync()
        navigate('/chat', { replace: true })
        if (!isDesktop) {
            setMobileShowSidebar(true)
        }
    }

    async function handleDeleteGroup() {
        if (!activeConversationId) return
        await deleteMutation.mutateAsync()
        navigate('/chat', { replace: true })
        if (!isDesktop) {
            setMobileShowSidebar(true)
        }
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

    const directParticipant = activeConversation ? getDirectParticipant(activeConversation, user?.id) : null
    const canStartCall = activeConversation
        ? activeConversation.type === 'direct'
            ? canCallWorkspaceUser(user) && canCallWorkspaceUser(directParticipant) && directParticipant?.status !== 'busy'
            : canCallWorkspaceUser(user)
        : false
        
    const calleeIds = useMemo(() => {
        if (!activeConversation || !user) return []
        return activeConversation.participants
            .filter(p => p.id !== user.id && p.status !== 'busy' && canCallWorkspaceUser(p))
            .map(p => p.id)
    }, [activeConversation, user])

    const thread = (
        <>
            <ChatHeader
                conversation={activeConversation}
                currentUserId={user?.id}
                users={users}
                onOpenProfile={openProfile}
                showBackButton={!isDesktop && !mobileShowSidebar}
                isUpdatingGroup={updateMutation.isPending}
                onBack={handleBackToList}
                onStartCall={canStartCall ? (type) => void startCall(activeConversation!.id, type, calleeIds) : undefined}
                onUpdateGroup={activeConversation?.type === 'group' ? handleUpdateGroup : undefined}
                onLeaveGroup={activeConversation?.type === 'group' ? handleLeaveGroup : undefined}
                onDeleteGroup={canDeleteActiveGroup ? handleDeleteGroup : undefined}
                canDeleteGroup={canDeleteActiveGroup}
                isLeavingGroup={leaveMutation.isPending}
                isDeletingGroup={deleteMutation.isPending}
            />
            <MessageList
                conversation={activeConversation}
                messages={messages}
                currentUserId={user?.id}
                isLoading={isMessagesLoading}
                isError={isMessagesError}
                onRetry={() => void refetchMessages()}
                onReact={handleReact}
                onOpenProfile={openProfile}
            />
            <ChatComposer
                key={activeConversationId ?? 'none'}
                conversation={activeConversation}
                currentUserId={user?.id}
                onSend={handleSend}
                isSending={sendMutation.isPending}
            />
        </>
    )

    return (
        <>
            <ChatLayout
                sidebar={sidebar}
                thread={thread}
                showSidebar={isDesktop || mobileShowSidebar}
            />
            <UserProfileDialog
                user={profileUser}
                open={profileUser !== null}
                onOpenChange={(open) => !open && closeProfile()}
            />
        </>
    )
}
