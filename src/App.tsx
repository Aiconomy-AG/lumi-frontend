import { useEffect, useState } from 'react'
import { getUsers } from './api/client'
import type { User } from './types/user'

export default function App() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900">Lush.ch Platform</h1>
        <p className="mt-1 text-sm text-slate-500">
          Data source:{' '}
          <span className="font-mono">
            {import.meta.env.VITE_USE_MOCK !== 'false' ? 'mock' : 'live API'}
          </span>
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          {loading && <p className="p-4 text-slate-500">Loading users...</p>}
          {error && <p className="p-4 text-red-600">Error: {error}</p>}
          {!loading && !error && (
            <ul className="divide-y divide-slate-100">
              {users.map((user) => (
                <li key={user.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {user.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
