import type { LoginCredentials, User } from '../types/user'
import { request, requestData } from './http'
import { setAuthToken, clearAuthToken } from './token'

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    data: credentials,
  })
  setAuthToken(response.token)
  return response.user
}

export async function logout(): Promise<void> {
  await request<void>('/auth/logout', { method: 'DELETE' })
  clearAuthToken()
}

export async function me(): Promise<User> {
  return requestData<User>('/auth/me')
}
