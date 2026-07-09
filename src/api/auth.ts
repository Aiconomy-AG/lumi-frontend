import type {
  LoginCredentials,
  User,
  UserStatus,
  ValidateResetTokenResponse,
  CompleteInvitePayload,
} from '../types/user'
import { request, requestData } from './http'
import { setAuthToken, clearAuthToken, getAuthToken } from './token'

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

export async function updateMyStatus(status: UserStatus): Promise<User> {
  return requestData<User>('/auth/me/status', {
    method: 'PATCH',
    data: { status },
  })
}

export async function sendPresencePing(): Promise<void> {
  await request('/auth/me/presence/ping', { method: 'POST' })
}

export function sendPresenceDisconnectBeacon(): void {
  const token = getAuthToken()
  if (!token || typeof navigator === 'undefined' || typeof window === 'undefined') {
    return
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:80/api/v1'
  const endpoint = `${apiUrl.replace(/\/$/, '')}/auth/me/presence/disconnect`
  const payload = JSON.stringify({ token })

  try {
    const blob = new Blob([payload], { type: 'application/json' })
    const beaconSent = navigator.sendBeacon(endpoint, blob)

    if (!beaconSent) {
      void fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true,
      })
    }
  } catch {
    // ignore best-effort disconnect failures
  }
}

export async function validateResetToken(email: string, token: string): Promise<ValidateResetTokenResponse> {
  const response = await request<{ message: string; data: ValidateResetTokenResponse }>(
    '/auth/reset-password/validate',
    { method: 'GET', params: { email, token } }
  )
  return response.data
}
export async function completeInvite(payload: CompleteInvitePayload): Promise<void> {
  await request('/auth/reset-password', {
    method: 'POST',
    data: payload,
  })
}