import type { CreateTaskPayload, Project, Task } from '@/types/task'
import { requestData } from './http'

export async function getTasks(): Promise<Task[]> {
  return requestData<Task[]>('/v1/workspace/tasks')
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  return requestData<Task>('/v1/workspace/tasks', {
    method: 'POST',
    data: payload,
  })
}

export async function getProjects(): Promise<Project[]> {
  return requestData<Project[]>('/v1/workspace/projects')
}
