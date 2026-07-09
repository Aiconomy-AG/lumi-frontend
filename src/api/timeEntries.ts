import type { TaskTimeEntry } from '@/types/task'
import { requestData } from './http'

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
