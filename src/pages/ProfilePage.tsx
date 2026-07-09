import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { updatePassword } from '@/api/users'
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
    const { user } = useAuth()

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
        <div className="p-10 max-w-120 mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <button
                    className="bg-transparent border-none text-zinc-500 hover:text-zinc-200 text-sm font-medium cursor-pointer transition-colors"
                    onClick={() => navigate(-1)}
                >
                    {t('profile.back')}
                </button>
            </div>

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
                <Field label={t('profile.id')} value={String(user.id)} />
                <Field label={t('profile.email')} value={user.email} />
                <Field label={t('profile.phone')} value={user.phone_number ?? "-"} />
                <Field label={t('profile.role')} value={user.role} />
                <Field label={t('profile.status')} value={user.status} />
            </div>

            <div className="flex items-center gap-4">
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
            </div>
        </div>
    )
}