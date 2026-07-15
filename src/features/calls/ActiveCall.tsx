import { Track } from 'livekit-client'
import {
  useTracks,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react'
import { Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WorkspaceCall } from '@/types/call'

interface ActiveCallProps {
  call: WorkspaceCall
  isGroup: boolean
  onToggleMinimize: () => void
  onLeave: () => void
}

export function ActiveCall({ call, isGroup, onToggleMinimize, onLeave }: ActiveCallProps) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  const screenShares = tracks.filter((t) => t.source === Track.Source.ScreenShare)
  const cameras = tracks.filter((t) => t.source === Track.Source.Camera)

  const hasOneShare = screenShares.length === 1

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950">
      <RoomAudioRenderer />
      
      <div className="flex-1 overflow-hidden flex" style={{ paddingBottom: '72px' }}>
        {hasOneShare ? (
          <div className="flex h-full w-full">
            {/* Filmstrip for cameras */}
            <div className="flex h-full w-[120px] shrink-0 flex-col gap-2 overflow-y-auto p-2 sm:w-[160px]">
              {cameras.map((track) => (
                <div key={track.participant.identity} className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                  <ParticipantTile trackRef={track} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            {/* Main stage for screen share */}
            <div className="flex h-full flex-1 items-center justify-center p-2">
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-zinc-900">
                <ParticipantTile trackRef={screenShares[0]} className="h-full w-full object-contain" />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full p-2">
            <GridLayout tracks={tracks} style={{ height: '100%', width: '100%' }}>
              <ParticipantTile className="h-full w-full overflow-hidden rounded-xl bg-zinc-900 object-cover" />
            </GridLayout>
          </div>
        )}
      </div>

      {/* Control Bar: fixed 72px footprint */}
      <div className="fixed bottom-0 left-0 right-0 z-[110] flex h-[72px] items-center justify-center bg-zinc-950/80 px-4 pb-safe backdrop-blur-md">
        <div className="relative flex w-full max-w-2xl items-center justify-center gap-4">
          <div className="lk-custom-controls flex items-center gap-4">
            <ControlBar
              controls={{
                microphone: true,
                camera: call.media_type === 'video',
                screenShare: true,
                leave: false,
                chat: false,
              }}
              className="!bg-transparent !p-0 !shadow-none"
            />
          </div>
          
          <Button 
            variant="destructive" 
            className="h-12 rounded-full px-6 font-semibold shadow-lg"
            onClick={onLeave}
          >
            {isGroup ? 'Leave' : 'End'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 h-12 w-12 text-zinc-400 hover:text-white"
            onClick={onToggleMinimize}
          >
            <Minimize2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
