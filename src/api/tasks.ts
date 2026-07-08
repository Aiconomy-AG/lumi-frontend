import type { Task, TaskStatus } from '../types/task'
import { requestData, delay } from './http'
import { USE_MOCK } from './config'
import { mockProjectTasks } from './mockProjects'

export interface CreateTaskPayload {
    title: string
    description: string
    status: TaskStatus
    due_date: string
    project_id: number
    parent_id?: number | null
}

export async function getTasks(): Promise<Task[]> {
    if (USE_MOCK) return delay([...mockProjectTasks])
    return requestData<Task[]>('/v1/workspace/tasks')
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    if (USE_MOCK) {
        const newTask: Task = {
            id: Date.now(),
            title: payload.title,
            description: payload.description,
            status: payload.status,
            due_date: payload.due_date,
            project_id: payload.project_id,
            parent_id: payload.parent_id ?? null,
            assignees: [],
        }
        mockProjectTasks.push(newTask)
        return delay(newTask)
    }
    return requestData<Task>('/v1/workspace/tasks', {
        method: 'POST',
        data: payload,
    })
}
