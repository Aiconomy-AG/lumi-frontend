import type { CreateUserPayload, User } from '../types/user'
import { request, requestData, delay } from './http'
import { USE_MOCK } from './config'
import { mockUsers } from './mockData'

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) return delay([...mockUsers])
  return requestData<User[]>('/v1/admin/users')
}

export async function getUser(id: number): Promise<User | undefined> {
  if (USE_MOCK) return delay(mockUsers.find((u) => u.id === id))
  return requestData<User>(`/v1/admin/users/${id}`)
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  if (USE_MOCK) {
    const newUser: User = {
      id: Date.now(),
      name: payload.name,
      email: payload.email,
      role: payload.role,
      status: payload.status ?? 'available',
      phone_number: payload.phone_number,
      is_active: true,
    }
    mockUsers.push(newUser)
    return delay(newUser)
  }
  return requestData<User>('/v1/admin/users', {
    method: 'POST',
    data: payload,
  })
}

export async function deactivateUser(id: number): Promise<void> {
  if (USE_MOCK) {
    const user = mockUsers.find((u) => u.id === id)
    if (user) user.is_active = false
    return delay(undefined)
  }
  await request<void>(`/v1/admin/users/${id}`, { method: 'DELETE' })
}

export async function reactivateUser(id: number): Promise<User> {
  if (USE_MOCK) {
    const user = mockUsers.find((u) => u.id === id)
    if (!user) throw new Error('User not found')
    user.is_active = true
    return delay(user)
  }
  return requestData<User>(`/v1/admin/users/${id}`, {
    method: 'PUT',
    data: { is_active: true },
  })
}
