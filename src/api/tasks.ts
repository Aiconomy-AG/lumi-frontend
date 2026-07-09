import type { Task, TaskStatus } from '@/types/task'
import { requestData } from './http'

export interface CreateTaskPayload {
    title: string
    description: string
    status: TaskStatus
    due_date: string
    project_id: number
    parent_id?: number | null
}

export async function getTasks(): Promise<Task[]> {
    return requestData<Task[]>('/workspace/tasks');
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    return requestData<Task>('/workspace/tasks', {
        method: 'POST',
        data: payload,
    })
}

export async function updateTask(id: number, payload: Partial<CreateTaskPayload>): Promise<Task> {
    return requestData<Task>(`/workspace/tasks/${id}`, {
        method: 'PUT',
        data: payload,
    })
}
