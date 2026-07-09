import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import axios from 'axios'

export default function AuthPage() {
    const { t } = useTranslation()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        try {
            await login({ email: email.trim().toLowerCase(), password })
        } catch (err) {
            if (!axios.isAxiosError(err) || !err.response) {
                setError(t('auth.errorUnknown'))
                return
            }
            const responseData = err.response.data as { message?: string; errors?: Record<string, string[]> } | undefined
            const backendError =
                responseData?.errors?.email?.[0] ??
                responseData?.errors?.password?.[0] ??
                responseData?.message
            if (err.response.status === 422) setError(t('auth.error422'))
            else if (err.response.status === 403) setError(t('auth.error403'))
            else if (err.response.status === 429) setError(t('auth.error429'))
            else setError(t('auth.errorUnknown'))
            if (backendError) {
                setError(`${backendError}`)
            }
        }
    }

    return (
        <div className="flex items-center justify-center w-screen h-screen bg-zinc-950 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-[400px] shadow-xl">

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-400 text-black font-bold text-xs mb-4">
                        LU
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                        {t('auth.signIn')}
                    </h2>
                    <p className="text-xs text-zinc-500">
                        {t('auth.signInSubtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-zinc-400">{t('auth.email')}</label>
                        <input
                            type="email"
                            placeholder="nume@example.com"
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 placeholder-zinc-700 outline-none focus:border-purple-500 transition-colors"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-zinc-400">{t('auth.password')}</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 placeholder-zinc-700 outline-none focus:border-purple-500 transition-colors"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn mt-2"
                    >
                        {t('auth.signIn')}
                    </button>
                </form>

                {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
            </div>
        </div>
    )
}
