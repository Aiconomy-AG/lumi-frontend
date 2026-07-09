import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTimeEntries, startTimeEntry, stopTimeEntry, getDailyTotalTime } from '@/api/client'
import { timeEntryKeys } from './queryKeys'

export function useDailyTotalTimeQuery(userId?: number) {
  return useQuery({
    queryKey: ['timeTracking', 'dailyTotal', userId],
    queryFn: () => getDailyTotalTime(userId!),
    enabled: !!userId,
    refetchInterval: 60000,
  })
}

export function useTimeEntriesQuery(taskId: number) {
  return useQuery({
    queryKey: timeEntryKeys.list(taskId),
    queryFn: () => getTimeEntries(taskId),
    enabled: Number.isFinite(taskId),
  })
}

export function useStartTimeEntryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: number) => startTimeEntry(taskId),
    onSuccess: (_entry, taskId) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.list(taskId) })
      queryClient.invalidateQueries({ queryKey: ['timeTracking', 'dailyTotal'] })
    },
  })
}

export function useStopTimeEntryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, entryId }: { taskId: number; entryId: number }) => stopTimeEntry(taskId, entryId),
    onSuccess: (_entry, variables) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.list(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: ['timeTracking', 'dailyTotal'] })
    },
  })
}
