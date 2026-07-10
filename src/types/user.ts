export type UserRole = 'admin' | 'employee' | 'client'
export type UserStatus = 'available' | 'busy' | 'offline' | 'away'

export const STATUS_TEXT_COLOR: Record<UserStatus, string> = {
  available: 'text-green-400',
  busy: 'text-red-400',
  away: 'text-yellow-400',
  offline: 'text-zinc-400',
}

export interface User {
  id: number
  role: UserRole
  email: string
  name: string
  phone_number?: string
  status: UserStatus
  language_flag?: string
  is_active: boolean
  must_change_password?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserPayload {
  email: string
  role: Exclude<UserRole, 'client'>
}

export interface ValidateResetTokenResponse {
  email: string
  name: string
  phone_number: string
  language_flag: string
}

export interface CompleteInvitePayload {
  email: string
  token: string
  password: string
  password_confirmation: string
  name: string
  phone_number?: string
  language_flag?: string
}