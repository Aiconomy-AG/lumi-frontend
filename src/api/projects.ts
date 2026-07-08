import type { Project, CreateProjectPayload } from '@/types/project'
import { request, requestData } from '@/api/http'

export async function getProjects(): Promise<Project[]> {
    return requestData<Project[]>('/v1/workspace/projects')
}

export async function getProject(id: number): Promise<Project> {
    return requestData<Project>(`/v1/workspace/projects/${id}`)
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
    return requestData<Project>('/v1/workspace/projects', {
        method: 'POST',
        data: payload,
    })
}

export async function updateProject(id: number, payload: CreateProjectPayload): Promise<Project> {
    return requestData<Project>(`/v1/workspace/projects/${id}`, {
        method: 'PUT',
        data: payload,
    })
}

export async function deleteProject(id: number): Promise<void> {
    await request<void>(`/v1/workspace/projects/${id}`, { method: 'DELETE' })
}
