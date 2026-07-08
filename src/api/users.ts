import type { CreateUserPayload, User } from '../types/user'
import { request, requestData } from './http'

export async function getUsers(): Promise<User[]> {
  return requestData<User[]>('/v1/admin/users')
}

export async function getUser(id: number): Promise<User | undefined> {
  return requestData<User>(`/v1/admin/users/${id}`)
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  return requestData<User>('/v1/admin/users', {
    method: 'POST',
    data: payload,
  })
}

export async function deactivateUser(id: number): Promise<void> {
  await request<void>(`/v1/admin/users/${id}`, { method: 'DELETE' })
}

export async function reactivateUser(id: number): Promise<User> {
  return requestData<User>(`/v1/admin/users/${id}`, {
    method: 'PUT',
    data: { is_active: true },
  })
}
