export interface Assignee {
    initials: string
    color: string
}

export type TaskStatus = 'To do' | 'In progress' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High'

export interface Task {
    id: number
    title: string
    project: string
    priority: TaskPriority
    status: TaskStatus
    due: string
    dotColor: string
    isDone?: boolean
    assignees: Assignee[]
}
