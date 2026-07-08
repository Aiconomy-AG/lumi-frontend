import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from '@/api/client'
import type { CreateProjectPayload } from '@/types/project'
import { projectKeys } from './queryKeys'

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: getProjects,
  })
}

export function useProjectQuery(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: Number.isFinite(id),
  })
}

export function useSaveProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: CreateProjectPayload }) =>
      id ? updateProject(id, payload) : createProject(payload),
    onSuccess: (_project, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) })
      }
    },
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) })
    },
  })
}
