import type { CreateUserPayload, User } from '@/types/user'
import { request, requestData } from './http'

export async function getUsers(): Promise<User[]> {
  return requestData<User[]>('/users')
}

export async function getUser(id: number): Promise<User | undefined> {
  return requestData<User>(`/admin/users/${id}`)
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  return requestData<User>('/admin/users', {
    method: 'POST',
    data: payload,
  })
}

export async function deactivateUser(id: number): Promise<void> {
  await request<void>(`/admin/users/${id}`, { method: 'DELETE' })
}

export async function reactivateUser(id: number): Promise<User> {
  return requestData<User>(`/admin/users/${id}`, {
    method: 'PUT',
    data: { is_active: true },
  })
}

export async function resendInvite(id: number): Promise<void> {
  await request<void>(`/admin/users/${id}/resend-invite`, { method: 'POST' })
}

export async function updatePassword(id: number, payload: { current_password: string, password: string, password_confirmation: string }): Promise<void> {
  await request<void>(`/admin/users/${id}`, {
    method: 'PUT',
    data: payload
  })
}
