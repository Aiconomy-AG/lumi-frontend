import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { updatePassword } from '@/api/users'
import { STATUS_TEXT_COLOR, type UserStatus } from '@/types/user'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

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
    const { user, logout, updateStatus } = useAuth()

    const [isPasswordOpen, setIsPasswordOpen] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const passwordMutation = useMutation({
        mutationFn: (payload: any) => updatePassword(user!.id, payload),
        onSuccess: () => {
            setIsPasswordOpen(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            alert("Password updated successfully!")
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || "Failed to update password. Check your current password.")
        }
    })

    const statusMutation = useMutation({
        mutationFn: (status: UserStatus) => updateStatus(status),
        onError: (err: any) => {
            alert(err?.response?.data?.message || "Failed to update status.")
        }
    })

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match!")
            return
        }
        passwordMutation.mutate({
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword
        })
    }

    if (!user) {
        return <div className="p-10 text-sm text-zinc-500">{t('profile.loading')}</div>
    }

    const initials = user.name.split(' ').map((w) => w[0]).join('').toUpperCase()

    return (
        <div className="p-10 max-w-[480px] mx-auto w-full">
            <Button
                variant="ghost"
                size="sm"
                className="mb-6"
                onClick={() => navigate(-1)}
            >
                {t('profile.back')}
            </Button>

            <div className="flex items-center gap-4 mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-400 text-lg font-bold text-black select-none">
                    {initials}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white m-0">{user.name}</h2>
                    <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
                <Field label={t('profile.email')} value={user.email} />
                <Field label={t('profile.phone')} value={user.phone_number ?? "-"} />
                <Field label={t('profile.role')} value={user.role} />
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('profile.status')}</span>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full bg-current ${STATUS_TEXT_COLOR[user.status]}`} />
                        <select
                            value={user.status === 'offline' ? 'available' : user.status}
                            disabled={statusMutation.isPending}
                            onChange={(e) => statusMutation.mutate(e.target.value as UserStatus)}
                            className={`bg-transparent text-sm font-medium capitalize outline-none cursor-pointer disabled:opacity-50 ${STATUS_TEXT_COLOR[user.status]}`}
                            aria-label={t('profile.status')}
                        >
                            <option value="available" className="bg-zinc-900 text-zinc-200">{t('userStatus.available')}</option>
                            <option value="busy" className="bg-zinc-900 text-zinc-200">{t('userStatus.busy')}</option>
                            <option value="away" className="bg-zinc-900 text-zinc-200">{t('userStatus.away')}</option>
                        </select>
                    </div>
                </div>
            </div>
                <div className="flex flex-col gap-4">
                    <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                        <DialogTrigger render={
                            <button className="flex-1 w-full bg-purple-600/10 border border-purple-500/30 text-purple-400 hover:bg-purple-600/20 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                                Change Password
                            </button>

                        } />

                        <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100">
                            <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSavePassword} className="flex flex-col gap-4 mt-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-zinc-400">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-zinc-400">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-zinc-400">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={passwordMutation.isPending}
                                    className="mt-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-2 rounded-md font-medium text-sm border-none cursor-pointer transition-colors"
                                >
                                    {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                                </button>

                            </form>
                        </DialogContent>

                    </Dialog>
                    <button
                        type="button"
                        disabled={passwordMutation.isPending}
                        onClick={() => void logout()}
                        className="flex-1 w-full flex items-center justify-center gap-2 bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 hover:border-red-500/50 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        {t('auth.logout')}
                    </button>
                </div>
            </div>
    )
}