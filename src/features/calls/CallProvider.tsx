import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { LiveKitRoom } from '@livekit/components-react'
import '@livekit/components-styles'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {acceptCall, cancelCall, leaveCall, declineCall, endCall, getActiveCall, startCall} from '@/api/calls'
import { useAuth } from '@/features/auth/AuthContext'
import { connectEcho } from '@/lib/echo'
import type { WorkspaceCall } from '@/types/call'
import { CallOverlay } from './CallOverlay'
import { callKeys } from './queryKeys'
import { userKeys } from '@/features/users/queryKeys'

const TERMINAL = new Set(['declined', 'cancelled', 'missed', 'ended', 'failed'])

function clientInstanceId(): string {
  const key = 'lumi.call.client_instance_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  
  const value = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).substring(2)
    
  localStorage.setItem(key, value)
  return value
}

interface CallContextValue {
  start: (conversationId: number, type?: 'audio' | 'video') => Promise<void>
}

const CallContext = createContext<CallContextValue | null>(null)

export function CallProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const instanceId = useMemo(clientInstanceId, [])
  const [call, setCall] = useState<WorkspaceCall | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Room management is now handled by LiveKitRoom component
  const leaveRoom = useCallback(async () => {
    setConnectionState('disconnected')
    setMuted(false)
  }, [])

  const activeQuery = useQuery({
    queryKey: callKeys.active(instanceId),
    queryFn: () => getActiveCall(instanceId),
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  useEffect(() => {
    const recovered = activeQuery.data
    if (recovered === undefined) return
    setCall(recovered)
  }, [activeQuery.data])

  useEffect(() => {
    if (!user) return
    const echo = connectEcho()
    if (!echo) return
    const channelName = `users.${user.id}`
    const channel = echo.private(channelName)

    channel.listen('.call.ringing', (payload: WorkspaceCall) => {
      setError(null)
      setCall((current) => {
        if (!current || current.id !== payload.id) return payload
        return {
          ...payload,
          media_type: current.media_type === 'video' ? 'video' : payload.media_type,
          type: current.type === 'video' ? 'video' : payload.type,
        }
      })
    })
    channel.listen('.call.updated', (payload: WorkspaceCall) => {
      setCall((current) => {
        if (current?.id !== payload.id) return current

        // Preserve video type in case backend doesn't support persisting it yet
        const patchedPayload = {
          ...payload,
          media_type: current.media_type === 'video' ? 'video' : payload.media_type,
          type: current.type === 'video' ? 'video' : payload.type,
        }

        if (TERMINAL.has(patchedPayload.status)) {
          void leaveRoom()
          window.setTimeout(() => {
            setCall(null)
            queryClient.invalidateQueries({ queryKey: userKeys.all })
          }, 1200)
        } else if (
          patchedPayload.status === 'active' &&
          patchedPayload.initiated_by_user_id !== user.id &&
          patchedPayload.answered_client_instance_id &&
          patchedPayload.answered_client_instance_id !== instanceId &&
          (patchedPayload as any).mode !== 'group' &&
          patchedPayload.participants.length <= 2
        ) {
          setError('This call was answered on another device.')
          window.setTimeout(() => {
            setCall(null)
            queryClient.invalidateQueries({ queryKey: userKeys.all })
          }, 1600)
        }
        return patchedPayload as WorkspaceCall
      })
    })

    return () => {
      echo.leave(channelName)
    }
  }, [instanceId, leaveRoom, user])

  useEffect(() => () => { void leaveRoom() }, [leaveRoom])

  const start = useCallback(async (conversationId: number, type: 'audio' | 'video' = 'audio') => {
    if (!user) return
    setError(null)
    try {
      const created = await startCall(conversationId, instanceId, type)
      setCall({ ...created, media_type: type })
    } catch (cause) {
      const response = (cause as AxiosError<{ code?: string; message?: string }>).response
      setError(response?.data?.message ?? 'The call could not be started.')
    }
  }, [instanceId, user])

  const accept = useCallback(async () => {
    if (!call) return
    try {
      const accepted = await acceptCall(call.id, instanceId)
      setCall(accepted)
    } catch (cause) {
      const response = (cause as AxiosError<{ code?: string; message?: string }>).response
      setError(response?.data?.code === 'ANSWERED_ELSEWHERE' ? 'This call was answered on another device.' : response?.data?.message ?? 'Unable to answer the call.')
    }
  }, [call, instanceId])

  const finish = useCallback(async (action: 'decline' | 'cancel' | 'end' | 'leave') => {
    if (!call) return
    let promise
    if (action === 'leave') {
      promise = leaveCall(call.id)
    } else {
      const fn = action === 'decline' ? declineCall : action === 'cancel' ? cancelCall : endCall
      promise = fn(call.id)
    }
    try {
      await promise
    } finally {
      await leaveRoom()
      setCall(null)
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    }
  }, [call, leaveRoom, queryClient])

  const toggleMute = useCallback(async () => {
    setMuted((m) => !m)
  }, [])

  const toggleMinimize = useCallback(() => {
    setMinimized(m => !m)
  }, [])

  return (
    <CallContext.Provider value={{ start }}>
      {children}
      {error && !call && (
        <button
          type="button"
          onClick={() => setError(null)}
          className="fixed bottom-6 right-6 z-80 max-w-sm rounded-lg border border-red-500/30 bg-zinc-950 px-4 py-3 text-left text-sm text-red-300 shadow-xl"
        >
          {error}
        </button>
      )}
      {call && user && call.connection && (call.status === 'active' || call.initiated_by_user_id === user.id) ? (
        <LiveKitRoom
          serverUrl={call.connection.url}
          token={call.connection.token}
          connect={true}
          audio={!muted}
          video={call.media_type === 'video' || (call as any).type === 'video' || (call as any).call_type === 'video'}
          onConnected={() => setConnectionState('connected')}
          onDisconnected={() => {
            setConnectionState('disconnected')
          }}
        >
          <CallOverlay
            call={call}
            currentUserId={user.id}
            connectionState={connectionState}
            muted={muted}
            minimized={minimized}
            error={error}
            onAccept={() => void accept()}
            onDecline={() => void finish('decline')}
            onCancel={() => void finish('cancel')}
            onEnd={() => void finish((call as any).mode === 'group' || call.participants.length > 2 ? 'leave' : 'end')}
            onToggleMute={() => void toggleMute()}
            onToggleMinimize={() => void toggleMinimize()}
          />
        </LiveKitRoom>
      ) : call && user ? (
        <CallOverlay
          call={call}
          currentUserId={user.id}
          connectionState={connectionState}
          muted={muted}
          minimized={minimized}
          error={error}
          onAccept={() => void accept()}
          onDecline={() => void finish('decline')}
          onCancel={() => void finish('cancel')}
          onEnd={() => void finish((call as any).mode === 'group' || call.participants.length > 2 ? 'leave' : 'end')}
          onToggleMute={() => void toggleMute()}
          onToggleMinimize={() => void toggleMinimize()}
        />
      ) : null}
    </CallContext.Provider>
  )
}

export function useCalls(): CallContextValue {
  const context = useContext(CallContext)
  if (!context) throw new Error('useCalls must be used within CallProvider')
  return context
}
