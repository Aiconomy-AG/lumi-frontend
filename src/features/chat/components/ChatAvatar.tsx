import { useEffect, useState } from 'react'
import { Bot, Users } from 'lucide-react'
import type { User } from '@/types/user'
import { avatarColorFor, initialsFor, statusDotColors } from '../utils'

interface AvatarProps {
    user?: (Pick<User, 'id' | 'name' | 'status'> | Pick<User, 'id' | 'name'>) & { is_bot?: boolean; avatar_url?: string | null } | null
    label?: string
    showStatus?: boolean
    className?: string
}

export function ChatAvatar({ user, label, showStatus = false, className = 'h-9 w-9' }: AvatarProps) {
    const displayName = user?.name ?? label ?? '?'
    const colorId = user?.id ?? displayName.length
    const isBot = user?.is_bot === true
    const avatarUrl = user?.avatar_url
    const [imageFailed, setImageFailed] = useState(false)

    useEffect(() => {
        setImageFailed(false)
    }, [avatarUrl])

    if (isBot) {
        return (
            <div
                className={`relative flex shrink-0 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 ${className}`}
            >
                <Bot className="h-4 w-4" />
            </div>
        )
    }

    const showImage = Boolean(avatarUrl) && !imageFailed

    return (
        <div
            className={`relative flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${
                showImage ? 'bg-zinc-800' : avatarColorFor(colorId)
            } ${className}`}
        >
            {showImage ? (
                <img
                    src={avatarUrl!}
                    alt={displayName}
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                    className="h-full w-full rounded-full object-cover"
                />
            ) : (
                initialsFor(displayName)
            )}
            {showStatus && user && 'status' in user && user.status && (
                <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 ${statusDotColors[user.status]}`}
                />
            )}
        </div>
    )
}

interface GroupAvatarProps {
    participants: Pick<User, 'id' | 'name' | 'avatar_url'>[]
    groupName?: string
    className?: string
}

export function GroupAvatar({ participants, groupName, className = 'h-10 w-10' }: GroupAvatarProps) {
    const visible = participants.slice(0, 3)

    if (visible.length === 0) {
        return (
            <div
                className={`flex shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/15 text-violet-300 ${className}`}
            >
                <Users className="h-4 w-4" />
            </div>
        )
    }

    if (visible.length === 1) {
        return (
            <div className={`relative shrink-0 ${className}`}>
                <div className="flex h-full w-full items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/15">
                    <ChatAvatar user={visible[0]} className="h-7 w-7" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-950 bg-violet-500 text-[9px] text-white">
                    <Users className="h-2.5 w-2.5" />
                </span>
            </div>
        )
    }

    return (
        <div className={`relative shrink-0 ${className}`}>
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-violet-500/30 bg-zinc-900">
                <div className="relative h-7 w-8">
                    {visible.slice(0, 2).map((participant, index) => (
                        <div
                            key={participant.id}
                            className={`absolute flex h-5 w-5 overflow-hidden items-center justify-center rounded-full border border-zinc-950 text-[8px] font-semibold text-white ${participant.avatar_url ? 'bg-zinc-800' : avatarColorFor(participant.id)}`}
                            style={{
                                top: index === 0 ? 0 : 'auto',
                                bottom: index === 1 ? 0 : 'auto',
                                left: index === 0 ? 0 : 'auto',
                                right: index === 1 ? 0 : 'auto',
                            }}
                        >
                            {participant.avatar_url ? (
                                <img
                                    src={participant.avatar_url}
                                    alt={participant.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                initialsFor(participant.name).charAt(0)
                            )}
                        </div>
                    ))}
                    {visible.length > 2 && (
                        <div className="absolute bottom-0 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border border-zinc-950 bg-zinc-700 text-[7px] font-semibold text-zinc-200">
                            +{visible.length - 2}
                        </div>
                    )}
                </div>
            </div>
            <span
                className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-950 bg-violet-500 text-white"
                title={groupName}
            >
                <Users className="h-2.5 w-2.5" />
            </span>
        </div>
    )
}
