import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTask, getTasks, updateTask, assignTask, unassignTask, type CreateTaskPayload, type UpdateTaskPayload } from '@/api/client'
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

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: UpdateTaskPayload }) => updateTask(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

export function useAssignTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, employeeId }: { taskId: number, employeeId: number }) => assignTask(taskId, employeeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

export function useUnassignTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, employeeId }: { taskId: number, employeeId: number }) => unassignTask(taskId, employeeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}
