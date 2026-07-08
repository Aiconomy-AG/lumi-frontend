export type UserRole = 'admin' | 'employee' | 'client'
export type UserStatus = 'available' | 'busy' | 'offline' | 'away'

export interface User {
  id: number
  role: UserRole
  email: string
  name: string
  phone_number?: string
  status: UserStatus
  language_flag?: string
  is_active: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: Exclude<UserRole, 'client'>
  status?: UserStatus
  phone_number?: string
  language_flag?: string
}