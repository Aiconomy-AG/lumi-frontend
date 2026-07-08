import type { Project, CreateProjectPayload } from '@/types/project'
import { request, requestData, delay } from '@/api/http'
import { USE_MOCK } from './config'
import { mockProjects } from './mockProjects'

export async function getProjects(): Promise<Project[]> {
    if (USE_MOCK) return delay([...mockProjects])
    return requestData<Project[]>('/v1/workspace/projects')
}

export async function getProject(id: number): Promise<Project> {
    if (USE_MOCK) {
        const found = mockProjects.find((p) => p.id === id)
        if (!found) throw new Error('Project not found')
        return delay(found)
    }
    return requestData<Project>(`/v1/workspace/projects/${id}`)
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
    if (USE_MOCK) {
        const newProject: Project = { id: Date.now(), ...payload }
        mockProjects.push(newProject)
        return delay(newProject)
    }
    return requestData<Project>('/v1/workspace/projects', {
        method: 'POST',
        data: payload,
    })
}

export async function updateProject(id: number, payload: CreateProjectPayload): Promise<Project> {
    if (USE_MOCK) {
        const project = mockProjects.find((p) => p.id === id)
        if (!project) throw new Error('Project not found')
        Object.assign(project, payload)
        return delay(project)
    }
    return requestData<Project>(`/v1/workspace/projects/${id}`, {
        method: 'PUT',
        data: payload,
    })
}

export async function deleteProject(id: number): Promise<void> {
    if (USE_MOCK) {
        const idx = mockProjects.findIndex((p) => p.id === id)
        if (idx !== -1) mockProjects.splice(idx, 1)
        return delay(undefined)
    }
    await request<void>(`/v1/workspace/projects/${id}`, { method: 'DELETE' })
}
