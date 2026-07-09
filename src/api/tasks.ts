import type { Task, TaskStatus } from '@/types/task'
import { request, requestData } from './http'

export interface CreateTaskPayload {
    title: string
    description: string
    status: TaskStatus
    due_date: string
    project_id: number
    parent_id?: number | null
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export async function getTasks(): Promise<Task[]> {
    return requestData<Task[]>('/workspace/tasks');
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    return requestData<Task>('/workspace/tasks', {
        method: 'POST',
        data: payload,
    })
}

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
    return requestData<Task>(`/workspace/tasks/${id}`, {
        method: 'PUT',
        data: payload,
    })
}

export async function assignTask(taskId: number, employeeId: number): Promise<void> {
    await request<void>(`/workspace/tasks/${taskId}/assignees`, {
        method: 'POST',
        data: {
            employee_ids: [employeeId]
        }
    })
}

export async function unassignTask(taskId: number, employeeId: number): Promise<void> {
    await request<void>(`/workspace/tasks/${taskId}/assignees/${employeeId}`, {
        method: 'DELETE'
    })
}
