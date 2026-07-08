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

export const mockTasks: Task[] = [
    {
        id: 1,
        project_id: 1,
        title: 'Implement authentication module',
        description: 'Set up JWT based authentication for the backend.',
        status: 'in_progress',
        due_date: '2026-07-10T12:00:00Z',
        assignees: [
            { id: 1, name: 'Ana Popescu', email: 'ana@company.com', phone_number: '0700000001', role: 'admin', status: 'available', is_active: true },
            { id: 2, name: 'Radu Popescu', email: 'radu@company.com', phone_number: '0700000002', role: 'admin', status: 'busy', is_active: true }
        ]
    },
    {
        id: 2,
        project_id: 1,
        title: 'Dashboard redesign',
        description: 'Create a new layout for the dashboard.',
        status: 'to_do',
        due_date: '2026-07-15T12:00:00Z',
        assignees: [
            { id: 3, name: 'Maria Ionescu', email: 'maria@company.com', phone_number: '0700000003', role: 'admin', status: 'away', is_active: true }
        ]
    },
    {
        id: 3,
        project_id: 2,
        title: 'Update dependencies',
        description: 'Upgrade React and Tailwind to the latest versions.',
        status: 'complete',
        due_date: '2026-07-05T12:00:00Z',
        assignees: []
    }
];

export async function getTasks(): Promise<Task[]> {
    //Return mock data for now instead of the real endpoint
    // #TODO: replace the line code inside the function with the line below to get the actual data
    // return requestData<Task[]>('/v1/workspace/tasks')
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockTasks), 300);
    });
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    return requestData<Task>('/v1/workspace/tasks', {
        method: 'POST',
        data: payload,
    })
}
