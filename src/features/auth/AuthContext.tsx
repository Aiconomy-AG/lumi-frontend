import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthToken, login as loginRequest, logout as logoutRequest, me, updateMyStatus } from '@/api/client'
import type { LoginCredentials, User, UserStatus } from '@/types/user'
import { authKeys } from './queryKeys'
import { userKeys } from '@/features/users'
import { connectEcho, disconnectEcho } from '@/lib/echo'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  updateStatus: (status: UserStatus) => Promise<void>
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

  const updateStatus = useCallback(async (status: UserStatus) => {
    const updatedUser = await updateMyStatus(status)
    queryClient.setQueryData(authKeys.me(), updatedUser)
    queryClient.setQueryData<User[] | undefined>(userKeys.all, (prev) =>
      prev?.map((existingUser) =>
        existingUser.id === updatedUser.id
          ? { ...existingUser, status: updatedUser.status }
          : existingUser
      )
    )
    await queryClient.invalidateQueries({ queryKey: userKeys.all })
  }, [queryClient])

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
      updateStatus,
    }),
    [user, isLoading, login, logout, updateStatus]
  )

  useEffect(() => {
    if (!hasToken) {
      disconnectEcho()
      return
    }

    const echo = connectEcho()

    if (!echo) {
      return
    }

    const channel = echo.join('team')

    channel.here((members: Array<{ id: number; status?: UserStatus }>) => {
      const statusByUserId = new Map(
        members.map((member) => [member.id, member.status ?? 'available' as UserStatus])
      )

      queryClient.setQueryData<User[] | undefined>(userKeys.all, (prev) =>
        prev?.map((existingUser) => {
          const presenceStatus = statusByUserId.get(existingUser.id)
          if (!presenceStatus) {
            return existingUser
          }

          return { ...existingUser, status: presenceStatus }
        })
      )
    })

    channel.joining((member: { id: number; status?: UserStatus }) => {
      const nextStatus = member.status ?? 'available'
      queryClient.setQueryData<User[] | undefined>(userKeys.all, (prev) =>
        prev?.map((existingUser) =>
          existingUser.id === member.id ? { ...existingUser, status: nextStatus } : existingUser
        )
      )
    })

    channel.leaving((member: { id: number }) => {
      queryClient.setQueryData<User[] | undefined>(userKeys.all, (prev) =>
        prev?.map((existingUser) =>
          existingUser.id === member.id ? { ...existingUser, status: 'offline' } : existingUser
        )
      )
    })

    channel.listen('.user.status.updated', (payload: { user_id: number; status: UserStatus }) => {
      queryClient.setQueryData<User[] | undefined>(userKeys.all, (prev) =>
        prev?.map((existingUser) =>
          existingUser.id === payload.user_id ? { ...existingUser, status: payload.status } : existingUser
        )
      )
    })

    return () => {
      echo.leave('team')
      disconnectEcho()
    }
  }, [hasToken, queryClient])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
