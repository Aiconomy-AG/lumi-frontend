import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageOff, Loader2, X } from 'lucide-react'
import type { MessageImage } from '@/types/chat'

const MAX_BUBBLE_WIDTH = 280
const MAX_BUBBLE_HEIGHT = 320

function scaledSize(image: MessageImage) {
    if (!image.width || !image.height) {
        return { width: MAX_BUBBLE_WIDTH, height: undefined }
    }

    const ratio = Math.min(MAX_BUBBLE_WIDTH / image.width, MAX_BUBBLE_HEIGHT / image.height, 1)

    return {
        width: Math.round(image.width * ratio),
        height: Math.round(image.height * ratio),
    }
}

interface MessageImageAttachmentProps {
    image: MessageImage
    isPending?: boolean
}

export function MessageImageAttachment({ image, isPending = false }: MessageImageAttachmentProps) {
    const { t } = useTranslation()
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasFailed, setHasFailed] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const { width, height } = scaledSize(image)

    if (hasFailed) {
        return (
            <div
                className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-4 text-xs text-zinc-300"
                style={{ width }}
            >
                <ImageOff className="h-4 w-4 shrink-0" />
                {t('chat.imageUnavailable')}
            </div>
        )
    }

    return (
        <>
            <button
                type="button"
                onClick={() => !isPending && setIsExpanded(true)}
                disabled={isPending}
                aria-label={t('chat.openImage')}
                className="relative block overflow-hidden rounded-lg bg-black/20 disabled:cursor-default"
                style={{ width, height }}
            >
                <img
                    src={image.thumb_url}
                    alt=""
                    loading="lazy"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasFailed(true)}
                    className={`h-full w-full object-cover transition-opacity ${
                        isLoaded && !isPending ? 'opacity-100' : 'opacity-60'
                    }`}
                />
                {(!isLoaded || isPending) && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white/80" />
                    </span>
                )}
            </button>

            {isExpanded && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setIsExpanded(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                >
                    <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        aria-label={t('chat.closeImage')}
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <img
                        src={image.url}
                        alt=""
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-full max-w-full rounded-lg object-contain"
                    />
                </div>
            )}
        </>
    )
}
