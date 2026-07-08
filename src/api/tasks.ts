import type { Task, TaskStatus } from '../types/task'
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
    return requestData<Task[]>('/v1/workspace/tasks')
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    return requestData<Task>('/v1/workspace/tasks', {
        method: 'POST',
        data: payload,
    })
}
