import type { TaskStatus } from '@/types/task'

export interface Project {
    id: number
    name: string
    description: string
    deadline: string
    status: TaskStatus
    created_at?: string
    updated_at?: string
}

export interface CreateProjectPayload {
    name: string
    description: string
    deadline: string
    status: TaskStatus
}
