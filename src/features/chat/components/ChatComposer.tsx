import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/types/chat'
import {
    getConversationTitle,
    IMAGE_ACCEPT_ATTRIBUTE,
    IMAGE_MAX_BYTES,
    isAcceptedImage,
    MESSAGE_MAX_LENGTH,
} from '../utils'

interface ChatComposerProps {
    conversation: Conversation | null
    currentUserId?: number
    onSend: (text: string, image?: File) => Promise<boolean>
    isSending: boolean
}

export function ChatComposer({ conversation, currentUserId, onSend, isSending }: ChatComposerProps) {
    const { t } = useTranslation()
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [draft, setDraft] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const atLimit = draft.length >= MESSAGE_MAX_LENGTH
    const nearLimit = draft.length >= MESSAGE_MAX_LENGTH - 200

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
    }, [draft])

    useEffect(() => {
        if (!image) {
            setPreviewUrl(null)
            return
        }

        const url = URL.createObjectURL(image)
        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [image])

    const placeholder = conversation
        ? t('chat.messagePlaceholder', { name: getConversationTitle(conversation, currentUserId) })
        : t('chat.messagePlaceholderDefault')

    const canSend = (draft.trim() !== '' || image !== null) && conversation !== null && !isSending && !atLimit

    function handleChange(value: string) {
        setDraft(value.slice(0, MESSAGE_MAX_LENGTH))
    }

    function clearImage() {
        setImage(null)
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    function handleFileSelected(file: File | undefined) {
        if (!file) return

        if (!isAcceptedImage(file)) {
            setError(t('chat.imageTypeError'))
            return
        }

        if (file.size > IMAGE_MAX_BYTES) {
            setError(t('chat.imageSizeError'))
            return
        }

        setError(null)
        setImage(file)
    }

    function handleSend() {
        if (!canSend) return

        const text = draft.trim()
        const pendingImage = image ?? undefined

        setDraft('')
        clearImage()

        void onSend(text, pendingImage).then((sent) => {
            if (!sent) {
                setDraft((current) => current || text)
                if (pendingImage) {
                    setImage(pendingImage)
                }
            }
        })
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSend()
        }
    }

    function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
        const pastedImage = Array.from(event.clipboardData.files).find((file) => file.type.startsWith('image/'))
        if (!pastedImage) return

        event.preventDefault()
        handleFileSelected(pastedImage)
    }

    return (
        <div className="border-t border-zinc-800 p-3">
            {previewUrl && (
                <div className="mb-2 flex items-start gap-2">
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt={image?.name ?? ''}
                            className="h-20 w-20 rounded-lg border border-zinc-700 object-cover"
                        />
                        <button
                            type="button"
                            onClick={clearImage}
                            aria-label={t('chat.removeImage')}
                            className="absolute -right-2 -top-2 rounded-full bg-zinc-800 p-1 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="mb-2 px-1 text-[11px] text-red-400">{error}</p>}

            <div className="flex items-end gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT_ATTRIBUTE}
                    className="hidden"
                    onChange={(event) => handleFileSelected(event.target.files?.[0])}
                />
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 shrink-0 rounded-full text-zinc-400 hover:text-zinc-100"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!conversation || isSending}
                    aria-label={t('chat.attachImage')}
                >
                    <ImagePlus className="h-4 w-4" />
                </Button>

                <div className="min-w-0 flex-1">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder={placeholder}
                        value={draft}
                        maxLength={MESSAGE_MAX_LENGTH}
                        onChange={(event) => handleChange(event.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        disabled={!conversation}
                        className="max-h-40 min-h-10 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500/50 disabled:opacity-50"
                    />
                    {nearLimit && (
                        <p
                            className={`mt-1 px-1 text-right text-[11px] ${
                                atLimit ? 'text-red-400' : 'text-zinc-500'
                            }`}
                        >
                            {t('chat.messageMaxLength', {
                                current: draft.length,
                                max: MESSAGE_MAX_LENGTH,
                            })}
                        </p>
                    )}
                </div>
                <Button
                    type="button"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full"
                    onClick={handleSend}
                    disabled={!canSend}
                    aria-label={t('chat.send')}
                >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
