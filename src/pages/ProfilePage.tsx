import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getUser } from '@/api/client'
import { currentUserId } from '@/api/mockChat'
import type { User } from '@/types/user'

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm text-zinc-200 font-medium capitalize">{value}</span>
        </div>
    )
}

export default function ProfilePage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        getUser(currentUserId).then((u) => setUser(u ?? null))
    }, [])

    if (!user) {
        return <div className="p-10 text-sm text-zinc-500">{t('profile.loading')}</div>
    }

    const initials = user.name.split(' ').map((w) => w[0]).join('').toUpperCase()

    return (
        <div className="p-10 max-w-[480px] mx-auto w-full">
            <button
                className="bg-transparent border-none text-zinc-500 hover:text-zinc-200 text-sm font-medium cursor-pointer mb-6 transition-colors"
                onClick={() => navigate(-1)}
            >
                {t('profile.back')}
            </button>

            <div className="flex items-center gap-4 mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-400 text-lg font-bold text-black select-none">
                    {initials}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white m-0">{user.name}</h2>
                    <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <Field label={t('profile.id')} value={String(user.id)} />
                <Field label={t('profile.email')} value={user.email} />
                <Field label={t('profile.phone')} value={user.phone_number ?? "-"} />
                <Field label={t('profile.role')} value={user.role} />
                <Field label={t('profile.status')} value={user.status} />
            </div>
        </div>
    )
}