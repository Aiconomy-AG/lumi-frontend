import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  deactivateUser,
  getUsers,
  reactivateUser,
} from '@/api/client'
import type { CreateUserPayload } from '@/types/user'
import { userKeys } from './queryKeys'

export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: getUsers,
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useReactivateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
