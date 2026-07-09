import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { completeInvite, validateResetToken } from '@/api/auth'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [languageFlag, setLanguageFlag] = useState('en')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  useEffect(() => {
    async function run() {
      if (!email || !token) {
        setInvalidLink(true)
        setIsChecking(false)
        return
      }

      try {
        const inviteData = await validateResetToken(email, token)
        setName(inviteData.name || '')
        setPhoneNumber(inviteData.phone_number || '')
        setLanguageFlag(inviteData.language_flag || 'en')
      } catch {
        setInvalidLink(true)
      } finally {
        setIsChecking(false)
      }
    }

    void run()
  }, [email, token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await completeInvite({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
        name: name.trim(),
        phone_number: phoneNumber.trim() || undefined,
        language_flag: languageFlag.trim() || undefined,
      })
      navigate('/login', { replace: true })
    } catch (err) {
      if (!axios.isAxiosError(err) || !err.response) {
        setError('Something went wrong.')
      } else {
        const data = err.response.data as { message?: string; errors?: Record<string, string[]> }
        setError(
          data?.errors?.email?.[0] ??
            data?.errors?.password?.[0] ??
            data?.errors?.name?.[0] ??
            data?.message ??
            'Something went wrong.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isChecking) {
    return <div className="p-6 text-sm text-muted-foreground">Validating invite link...</div>
  }

  if (invalidLink) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Invalid or expired link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask an admin to resend the invitation.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-zinc-950 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-[440px] shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Complete your account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Email</label>
            <input
              disabled
              value={email}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Phone number</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Language</label>
            <input
              value={languageFlag}
              onChange={(e) => setLanguageFlag(e.target.value)}
              placeholder="en"
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Confirm password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              minLength={8}
              required
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Saving...' : 'Save and continue'}
          </button>
        </form>

        {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}