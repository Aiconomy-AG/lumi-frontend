import type { TaskTimeEntry } from '@/types/task'
import { requestData, request } from './http'

export async function getTimeEntries(taskId: number): Promise<TaskTimeEntry[]> {
  return requestData<TaskTimeEntry[]>(`/workspace/tasks/${taskId}/time-entries`)
}

export async function startTimeEntry(taskId: number): Promise<TaskTimeEntry> {
  return requestData<TaskTimeEntry>(`/workspace/tasks/${taskId}/time-entries/start`, {
    method: 'POST',
  })
}

export async function stopTimeEntry(taskId: number, entryId: number): Promise<TaskTimeEntry> {
  return requestData<TaskTimeEntry>(`/workspace/tasks/${taskId}/time-entries/${entryId}/stop`, {
    method: 'POST',
  })
}

export async function getDailyTotalTime(userId: number): Promise<number> {
  const res: any = await request(`/workspace/users/${userId}/time-entries/daily-total`)
  return typeof res === 'number' ? res : (res.total_seconds ?? res.duration_seconds ?? res.total ?? 0)
}
