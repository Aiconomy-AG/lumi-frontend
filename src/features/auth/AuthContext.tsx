import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthToken, login as loginRequest, logout as logoutRequest, me } from '@/api/client'
import type { LoginCredentials, User } from '@/types/user'
import { authKeys } from './queryKeys'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => !!getAuthToken())

  const meQuery = useQuery({
    queryKey: authKeys.me(),
    queryFn: me,
    enabled: hasToken,
    retry: false,
    staleTime: Infinity,
  })

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (currentUser) => {
      queryClient.setQueryData(authKeys.me(), currentUser)
      setHasToken(true)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      setHasToken(false)
      queryClient.clear()
    },
  })

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const login = useCallback(async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials)
  }, [loginMutation])

  const user = hasToken ? meQuery.data ?? null : null
  const isLoading = hasToken && meQuery.isPending

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAdmin: user?.role === 'admin',
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
