import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageLightbox } from '@/components/ImageLightbox'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { STATUS_TEXT_COLOR, type User } from '@/types/user'
import { avatarColorFor, initialsFor, statusDotColors } from '@/features/chat/utils'

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
            <span className="truncate text-sm font-medium text-zinc-200">{value}</span>
        </div>
    )
}

interface UserProfileDialogProps {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserProfileDialog({ user, open, onOpenChange }: UserProfileDialogProps) {
    const { t } = useTranslation()
    const [isPhotoExpanded, setIsPhotoExpanded] = useState(false)
    const [photoFailed, setPhotoFailed] = useState(false)

    useEffect(() => {
        setPhotoFailed(false)
        setIsPhotoExpanded(false)
    }, [user?.id, user?.avatar_url])

    if (!user) return null

    const showPhoto = Boolean(user.avatar_url) && !photoFailed
    const isPending = user.must_change_password === true
    const isDeactivated = user.is_active === false

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('chat.profileTitle')}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-3 pb-2 pt-1">
                    <button
                        type="button"
                        onClick={() => showPhoto && setIsPhotoExpanded(true)}
                        disabled={!showPhoto}
                        aria-label={showPhoto ? t('chat.openImage') : undefined}
                        className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white select-none ${
                            showPhoto ? 'cursor-zoom-in bg-zinc-800' : `cursor-default ${avatarColorFor(user.id)}`
                        }`}
                    >
                        {showPhoto ? (
                            <img
                                src={user.avatar_url!}
                                alt={user.name}
                                onError={() => setPhotoFailed(true)}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            initialsFor(user.name)
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-1">
                        <h3 className="m-0 text-lg font-bold text-white">{user.name}</h3>
                        {isDeactivated ? (
                            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-300">
                                {t('chat.profileDeactivated')}
                            </span>
                        ) : isPending ? (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
                                {t('chat.profileNotEnabled')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs">
                                <span className={`h-2 w-2 rounded-full ${statusDotColors[user.status]}`} />
                                <span className={`capitalize ${STATUS_TEXT_COLOR[user.status]}`}>
                                    {t(`userStatus.${user.status}`)}
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <Field label={t('profile.email')} value={user.email} />
                    <Field label={t('profile.phone')} value={user.phone_number || '—'} />
                    <Field label={t('profile.role')} value={user.role} />
                </div>

                {showPhoto && (
                    <ImageLightbox
                        src={user.avatar_url!}
                        alt={user.name}
                        title={user.name}
                        open={isPhotoExpanded}
                        onOpenChange={setIsPhotoExpanded}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
