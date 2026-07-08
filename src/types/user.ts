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
}

export interface LoginCredentials {
  email: string;
  password: string;
}