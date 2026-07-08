import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoginCredentials } from '@/types/user'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Errors = { name?: string; email?: string; password?: string }

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
    const { t } = useTranslation()
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [errors, setErrors] = useState<Errors>({})
    const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({})

    function validate(values = { name, email, password }): Errors {
        const next: Errors = {}

        const trimmedEmail = values.email.trim()
        if (!trimmedEmail) next.email = t('auth.errorEmailRequired')
        else if (!EMAIL_REGEX.test(trimmedEmail)) next.email = t('auth.errorEmailInvalid')

        if (!values.password) next.password = t('auth.errorPasswordRequired')
        else if (values.password.length < 8) next.password = t('auth.errorPasswordShort')

        if (isRegister) {
            const trimmedName = values.name.trim()
            if (!trimmedName) next.name = t('auth.errorNameRequired')
            else if (trimmedName.length < 2) next.name = t('auth.errorNameShort')
        }

        return next
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const nextErrors = validate()
        setErrors(nextErrors)
        setTouched({ name: true, email: true, password: true })
        if (Object.keys(nextErrors).length > 0) return

        const payload: LoginCredentials = {
            email: email.trim(),
            password,
            ...(isRegister && { name: name.trim() }),
        }
        console.log('Auth payload:', payload)
        onLogin()
    }

    function handleBlur(field: 'name' | 'email' | 'password') {
        setTouched((prev) => ({ ...prev, [field]: true }))
        setErrors(validate())
    }

    function switchMode() {
        setIsRegister((prev) => !prev)
        setErrors({})
        setTouched({})
    }

    const inputBase =
        'bg-zinc-950 border rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors'
    function fieldClass(field: keyof Errors) {
        return `${inputBase} ${
            touched[field] && errors[field]
                ? 'border-red-500 focus:border-red-500'
                : 'border-zinc-800 focus:border-purple-500'
        }`
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                    {isRegister && (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-zinc-400">{t('auth.fullName')}</label>
                            <input
                                type="text"
                                className={fieldClass('name')}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onBlur={() => handleBlur('name')}
                                aria-invalid={touched.name && !!errors.name}
                            />
                            {touched.name && errors.name && (
                                <p className="text-xs text-red-400">{errors.name}</p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-zinc-400">{t('auth.email')}</label>
                        <input
                            type="email"
                            placeholder="nume@example.com"
                            className={fieldClass('email')}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            aria-invalid={touched.email && !!errors.email}
                        />
                        {touched.email && errors.email && (
                            <p className="text-xs text-red-400">{errors.email}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-zinc-400">{t('auth.password')}</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={fieldClass('password')}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            aria-invalid={touched.password && !!errors.password}
                        />
                        {touched.password && errors.password && (
                            <p className="text-xs text-red-400">{errors.password}</p>
                        )}
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
                        onClick={switchMode}
                    >
                        {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
                    </button>
                </div>
            </div>
        </div>
    )
}
