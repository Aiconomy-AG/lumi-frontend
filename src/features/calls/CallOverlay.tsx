import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { WorkspaceCall } from '@/types/call'

interface Props {
  call: WorkspaceCall
  currentUserId: number
  connectionState: string
  muted: boolean
  error: string | null
  onAccept: () => void
  onDecline: () => void
  onCancel: () => void
  onEnd: () => void
  onToggleMute: () => void
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
  error,
  onAccept,
  onDecline,
  onCancel,
  onEnd,
  onToggleMute,
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
  const displayName = incoming ? call.caller.name : other?.name ?? call.caller.name
  const subtitle = call.status === 'active'
      ? `${durationSince(call.answered_at)} · ${connectionState}`
      : incoming
        ? 'Lumi Workspace audio call'
        : 'Calling…'

  return (
    <Dialog open>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center">{incoming ? 'Incoming audio call' : 'Lumi audio call'}</DialogTitle>
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
