import type { LoginCredentials, User } from '../types/user'
import { request, requestData, delay } from './http'
import { setAuthToken, clearAuthToken } from './token'
import { USE_MOCK } from './config'

// user fictiv de admin cat lucram fara backend
const mockAdmin: User = {
  id: 1,
  name: 'Admin Local',
  email: 'admin@local.test',
  role: 'admin',
  status: 'available',
  is_active: true,
}

export async function login(credentials: LoginCredentials): Promise<User> {
  if (USE_MOCK) {
    setAuthToken('mock-token')
    return delay(mockAdmin)
  }
  const response = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    data: credentials,
  })
  setAuthToken(response.token)
  return response.user
}

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    clearAuthToken()
    return
  }
  await request<void>('/auth/logout', { method: 'DELETE' })
  clearAuthToken()
}

export async function me(): Promise<User> {
  if (USE_MOCK) return delay(mockAdmin)
  return requestData<User>('/auth/me')
}
