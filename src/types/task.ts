import type { User } from './user'

export type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'complete'

export interface Task {
    id: number
    title: string
    description?: string
    status: TaskStatus
    due_date: string
    parent_id?: number | null
    project_id: number
    assignees: User[]
}

export interface CreateTaskPayload {
    title: string
    description: string
    status: TaskStatus
    due_date: string
    project_id: number
    parent_id?: number | null
}

export interface Project {
    id: number
    name: string
    description?: string | null
    status: string
    deadline?: string | null
}

export interface TaskTimeEntry {
    id: number
    task_id: number
    employee_id: number
    started_at: string
    stopped_at: string | null
    duration_seconds: number | null
}