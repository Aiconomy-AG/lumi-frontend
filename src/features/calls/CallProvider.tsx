import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { LiveKitRoom } from '@livekit/components-react'
import '@livekit/components-styles'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { acceptCall, cancelCall, declineCall, endCall, getActiveCall, startCall } from '@/api/calls'
import { useAuth } from '@/features/auth/AuthContext'
import { connectEcho } from '@/lib/echo'
import type { WorkspaceCall } from '@/types/call'
import { CallOverlay } from './CallOverlay'
import { callKeys } from './queryKeys'

const TERMINAL = new Set(['declined', 'cancelled', 'missed', 'ended', 'failed'])

function clientInstanceId(): string {
  const key = 'lumi.call.client_instance_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const value = crypto.randomUUID()
  localStorage.setItem(key, value)
  return value
}

interface CallContextValue {
  start: (conversationId: number, type?: 'audio' | 'video') => Promise<void>
}

const CallContext = createContext<CallContextValue | null>(null)

export function CallProvider({ children }: { children: React.ReactNode }) {
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
      setCall(payload)
    })
    channel.listen('.call.updated', (payload: WorkspaceCall) => {
      setCall((current) => {
        if (current?.id !== payload.id) return current
        if (TERMINAL.has(payload.status)) {
          void leaveRoom()
          window.setTimeout(() => setCall(null), 1200)
        } else if (
          payload.status === 'active' &&
          payload.initiated_by_user_id !== user.id &&
          payload.answered_client_instance_id !== instanceId
        ) {
          setError('This call was answered on another device.')
          window.setTimeout(() => setCall(null), 1600)
        }
        return payload
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
      // Pass type to startCall if the backend supports it, otherwise default
      const created = await startCall(conversationId, instanceId, type)
      setCall({ ...created, type }) // Temporary override if backend doesn't return type
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

  const finish = useCallback(async (action: 'decline' | 'cancel' | 'end') => {
    if (!call) return
    const fn = action === 'decline' ? declineCall : action === 'cancel' ? cancelCall : endCall
    try {
      await fn(call.id)
    } finally {
      await leaveRoom()
      setCall(null)
    }
  }, [call, leaveRoom])

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
          className="fixed bottom-6 right-6 z-[80] max-w-sm rounded-lg border border-red-500/30 bg-zinc-950 px-4 py-3 text-left text-sm text-red-300 shadow-xl"
        >
          {error}
        </button>
      )}
      {call && user && call.status === 'active' && call.connection ? (
        <LiveKitRoom
          serverUrl={call.connection.url}
          token={call.connection.token}
          connect={true}
          audio={!muted}
          video={call.type === 'video'}
          onConnected={() => setConnectionState('connected')}
          onDisconnected={() => setConnectionState('disconnected')}
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
            onEnd={() => void finish('end')}
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
          onEnd={() => void finish('end')}
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
