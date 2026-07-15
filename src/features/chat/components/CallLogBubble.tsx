import { Phone, PhoneCall, PhoneMissed, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Message } from '@/types/chat'

interface CallLogBubbleProps {
    message: Message
}

export function CallLogBubble({ message }: CallLogBubbleProps) {
    const { t } = useTranslation()
    const call = message.call

    if (!call) return null

    const isVideo = (call as any).type === 'video' || (call as any).call_type === 'video' || call.media_type === 'video'
    const isMissed = call.status === 'missed' || call.status === 'declined' || call.status === 'cancelled'

    let Icon = Phone
    if (isVideo) Icon = Video
    else if (isMissed) Icon = PhoneMissed
    else Icon = PhoneCall

    let text = t(`chat.callLog.${call.status}`, { defaultValue: 'Audio call' })
    if (isVideo) {
        text = t(`chat.callLog.video_${call.status}`, { defaultValue: 'Video call' })
    }
    
    // Use the backend's message preview if available (e.g. "Video call · 5 min")
    const displayMessage = message.message || text

    return (
        <div className="flex justify-center py-2">
            <div className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 ${
                isMissed ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-300'
            }`}>
                <Icon className="h-3.5 w-3.5" />
                <span>{displayMessage}</span>
            </div>
        </div>
    )
}
