import type { User } from './user'

export type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'complete'

export interface Task {
    id: number
    project_id?: number
    title: string
    description?: string
    status: TaskStatus
    due_date: string
    parent_id?: number | null
    assignees: User[]
}

export interface TaskTimeEntry {
    id: number
    task_id: number
    employee_id: number
    started_at: string
    stopped_at: string | null
    duration_seconds: number | null
}