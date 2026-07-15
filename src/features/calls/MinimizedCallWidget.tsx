import { useState, useRef, useEffect } from 'react'
import { Maximize2, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTracks, GridLayout, ParticipantTile, TrackToggle } from '@livekit/components-react'
import { Track } from 'livekit-client'

interface MinimizedCallWidgetProps {
  onMaximize: () => void
  onEnd: () => void
}

export function MinimizedCallWidget({ onMaximize, onEnd }: MinimizedCallWidgetProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 320 - 24, y: window.innerHeight - 240 - 24 })
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      
      let newX = posStart.current.x + (e.clientX - dragStart.current.x)
      let newY = posStart.current.y + (e.clientY - dragStart.current.y)
      
      // Keep within bounds
      if (widgetRef.current) {
        const bounds = widgetRef.current.getBoundingClientRect()
        newX = Math.max(0, Math.min(newX, window.innerWidth - bounds.width))
        newY = Math.max(0, Math.min(newY, window.innerHeight - bounds.height))
      }
      
      setPosition({ x: newX, y: newY })
    }

    const handlePointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  return (
    <div
      ref={widgetRef}
      className="fixed z-[100] flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: '320px',
        height: '240px',
        resize: 'both',
        minWidth: '200px',
        minHeight: '150px',
        maxWidth: '800px',
        maxHeight: '600px'
      }}
    >
      {/* Drag Handle / Header */}
      <div 
        className="flex h-10 w-full shrink-0 cursor-grab items-center justify-between bg-zinc-900 px-3 active:cursor-grabbing"
        onPointerDown={(e) => {
          // Don't drag if clicking buttons or resizing (bottom right corner)
          if ((e.target as HTMLElement).closest('button') || e.clientX > position.x + (widgetRef.current?.offsetWidth || 0) - 20 && e.clientY > position.y + (widgetRef.current?.offsetHeight || 0) - 20) return
          isDragging.current = true
          dragStart.current = { x: e.clientX, y: e.clientY }
          posStart.current = { ...position }
          document.body.style.userSelect = 'none'
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
      >
        <span className="text-xs font-semibold text-zinc-400">Active Call</span>
        <div className="flex items-center gap-1">
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon={true}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white data-[state=off]:bg-red-500/20 data-[state=off]:text-red-400 [&>svg]:h-4 [&>svg]:w-4"
          />
          <TrackToggle
            source={Track.Source.Camera}
            showIcon={true}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white data-[state=off]:bg-red-500/20 data-[state=off]:text-red-400 [&>svg]:h-4 [&>svg]:w-4"
          />
          <div className="mx-1 h-4 w-px bg-zinc-700" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white"
            onClick={onMaximize}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-red-400 hover:bg-red-500 hover:text-white"
            onClick={onEnd}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Video Area */}
      <div className="flex-1 overflow-hidden bg-black p-1">
        <GridLayout tracks={tracks} style={{ height: '100%', width: '100%' }}>
          <ParticipantTile className="h-full w-full object-cover rounded-md overflow-hidden" />
        </GridLayout>
      </div>
    </div>
  )
}
