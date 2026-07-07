import type { User } from './user'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export interface Task {
    id: number
    title: string
    description?: string
    status: TaskStatus
    created_by: number
    due_date: string
    assignees: User[]
}

export interface TaskTimeEntry {
    id: number
    task_id: number
    employee_id: number
    started_at: string
    stopped_at?: string
    duration_seconds: number
}