import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTask, getTasks, type CreateTaskPayload } from '@/api/client'
import { taskKeys } from './queryKeys'

export function useTasksQuery() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: getTasks,
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}
