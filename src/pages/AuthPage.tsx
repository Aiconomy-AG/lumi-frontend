import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoginCredentials } from '@/types/user'
export default function AuthPage({ onLogin }: { onLogin: () => void }) {
    const { t } = useTranslation()
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (email && password) {
            const payload: LoginCredentials = {
                email,
                password,
                ...(isRegister && { name })
            }
            console.log("Auth payload:", payload)
            onLogin()
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
                        {isRegister ? t('auth.createAccount') : t('auth.signIn')}
                    </h2>
                    <p className="text-xs text-zinc-500">
                        {isRegister ? t('auth.createAccountSubtitle') : t('auth.signInSubtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {isRegister && (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-zinc-400">{t('auth.fullName')}</label>
                            <input
                                type="text"
                                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

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
                        className="bg-purple-500 hover:bg-purple-400 text-black font-semibold text-sm py-2.5 rounded-lg transition-colors mt-2"
                    >
                        {isRegister ? t('auth.register') : t('auth.signIn')}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        className="text-xs text-zinc-500 hover:text-purple-400 transition-colors bg-transparent border-none cursor-pointer"
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
                    </button>
                </div>
            </div>
        </div>
    )
}
