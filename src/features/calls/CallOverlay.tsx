import { Maximize2, Mic, MicOff, Minimize2, Phone, PhoneOff } from 'lucide-react'
import { VideoConference } from '@livekit/components-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { WorkspaceCall } from '@/types/call'

interface Props {
  call: WorkspaceCall
  currentUserId: number
  connectionState: string
  muted: boolean
  minimized: boolean
  error: string | null
  onAccept: () => void
  onDecline: () => void
  onCancel: () => void
  onEnd: () => void
  onToggleMute: () => void
  onToggleMinimize: () => void
}

function durationSince(start?: string | null): string {
  if (!start) return '00:00'
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 1000))
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

export function CallOverlay({
  call,
  currentUserId,
  connectionState,
  muted,
  minimized,
  error,
  onAccept,
  onDecline,
  onCancel,
  onEnd,
  onToggleMute,
  onToggleMinimize,
}: Props) {
  const [, tick] = useState(0)
  const isCaller = call.initiated_by_user_id === currentUserId
  const other = call.participants.find((participant) => participant.user_id !== currentUserId)

  useEffect(() => {
    if (call.status !== 'active') return
    const timer = window.setInterval(() => tick((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [call.status])

  const incoming = call.status === 'ringing' && !isCaller
  const isVideoOrGroup = call.media_type === 'video' || (call as any).type === 'video' || (call as any).call_type === 'video' || (call as any).mode === 'group'
  
  const callTypeLabel = isVideoOrGroup ? 'video' : 'audio'
  const displayName = incoming ? call.caller.name : other?.name ?? call.caller.name
  const subtitle = call.status === 'active'
      ? `${durationSince(call.answered_at)} · ${connectionState}`
      : incoming
        ? `Lumi Workspace ${callTypeLabel} call`
        : 'Calling…'

  if (minimized && call.status === 'active') {
    return (
      <div className="fixed bottom-6 right-6 z-[100] flex w-72 flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-100 shadow-2xl transition-all hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-sm font-bold text-purple-300 ring-1 ring-purple-400/30">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="truncate font-medium">{displayName}</p>
              <p className="truncate text-xs text-zinc-400">{durationSince(call.answered_at)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={onToggleMinimize} aria-label="Expand call">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center gap-4">
          <Button type="button" variant={muted ? 'secondary' : 'outline'} size="icon" className="h-10 w-10 rounded-full border-zinc-800" onClick={onToggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="destructive" size="icon" className="h-10 w-10 rounded-full" onClick={onEnd} aria-label="End call">
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // If this is a fullscreen active call that is video or group, use LiveKit's built-in VideoConference layout
  if (!minimized && (call.status === 'active' || (isCaller && call.status === 'ringing')) && isVideoOrGroup) {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-950">
        <Button variant="ghost" size="icon" className="absolute right-6 top-6 z-[110] text-zinc-400 hover:text-white" onClick={onToggleMinimize} aria-label="Minimize call">
          <Minimize2 className="h-6 w-6" />
        </Button>
        <VideoConference />
      </div>
    )
  }

  return (
    <Dialog open>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-sm" showCloseButton={false}>
        {call.status === 'active' && (
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-zinc-400 hover:text-white" onClick={onToggleMinimize} aria-label="Minimize call">
            <Minimize2 className="h-5 w-5" />
          </Button>
        )}
        <DialogHeader>
          <DialogTitle className="text-center">{incoming ? `Incoming ${callTypeLabel} call` : `Lumi ${callTypeLabel} call`}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/15 text-2xl font-bold text-purple-300 ring-1 ring-purple-400/30">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{displayName}</p>
            <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>

          {incoming ? (
            <div className="flex gap-8">
              <Button type="button" variant="destructive" size="icon-lg" className="rounded-full" onClick={onDecline} aria-label="Decline call">
                <PhoneOff />
              </Button>
              <Button type="button" size="icon-lg" className="rounded-full bg-emerald-600 hover:bg-emerald-500" onClick={onAccept} aria-label="Accept call">
                <Phone />
              </Button>
            </div>
          ) : call.status === 'ringing' ? (
            <Button type="button" variant="destructive" size="icon-lg" className="rounded-full" onClick={onCancel} aria-label="Cancel call">
              <PhoneOff />
            </Button>
          ) : (
            <div className="flex gap-8">
              <Button type="button" variant="secondary" size="icon-lg" className="rounded-full" onClick={onToggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted ? <MicOff /> : <Mic />}
              </Button>
              <Button type="button" variant="destructive" size="icon-lg" className="rounded-full" onClick={onEnd} aria-label="End call">
                <PhoneOff />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
