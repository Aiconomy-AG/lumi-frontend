import { Track } from 'livekit-client'
import {
    useTracks,
    GridLayout,
    ParticipantTile,
    TrackToggle,
    useMediaDeviceSelect,
} from '@livekit/components-react'
import { Minimize2, Settings } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { WorkspaceCall } from '@/types/call'

function DeviceSelect({ kind }: { kind: MediaDeviceKind }) {
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind })

  return (
    <select
      value={activeDeviceId}
      onChange={(e) => setActiveMediaDevice(e.target.value)}
      className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {devices.map((device) => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label || `Device ${device.deviceId}`}
        </option>
      ))}
    </select>
  )
}

interface ActiveCallProps {
  call: WorkspaceCall
  isGroup: boolean
  onToggleMinimize: () => void
  onLeave: () => void
}

export function ActiveCall({ call, isGroup, onToggleMinimize, onLeave }: ActiveCallProps) {
  const [showSettings, setShowSettings] = useState(false)
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
      <div className="fixed inset-0 z-40 flex flex-col bg-zinc-950">
      
      <div className="flex-1 overflow-hidden flex" style={{ paddingBottom: '72px' }}>
        {hasOneShare ? (
          <div className="flex h-full w-full">
            {/* Filmstrip for cameras */}
            <div className="flex h-full w-30 shrink-0 flex-col gap-2 overflow-y-auto p-2 sm:w-40">
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
      <div className="fixed bottom-0 left-0 right-0 z-45 flex h-18 items-center justify-center bg-zinc-950/80 px-4 pb-safe backdrop-blur-md">
        <div className="relative flex w-full max-w-2xl items-center justify-center gap-4">
          <div className="lk-custom-controls flex items-center gap-4">
            <TrackToggle
              source={Track.Source.Microphone}
              showIcon={true}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 data-[state=off]:bg-red-500 data-[state=off]:hover:bg-red-600 [&>svg]:h-5 [&>svg]:w-5"
            />
            {call.media_type === 'video' && (
              <TrackToggle
                source={Track.Source.Camera}
                showIcon={true}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 data-[state=off]:bg-red-500 data-[state=off]:hover:bg-red-600 [&>svg]:h-5 [&>svg]:w-5"
              />
            )}
            <TrackToggle
              source={Track.Source.ScreenShare}
              showIcon={true}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 data-[state=on]:bg-emerald-600 data-[state=on]:hover:bg-emerald-500 [&>svg]:h-5 [&>svg]:w-5"
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              onClick={() => setShowSettings(true)}
              aria-label="Open device settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
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
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Device Settings</DialogTitle>
            <DialogDescription>
              Select your preferred camera and microphone for this call.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">Microphone</label>
              <DeviceSelect kind="audioinput" />
            </div>
            {call.media_type === 'video' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Camera</label>
                <DeviceSelect kind="videoinput" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">Speaker Output</label>
              <DeviceSelect kind="audiooutput" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
