export interface User {
  id: number
  role: 'admin' | 'manager' | 'employee'
  email: string
  name: string
  phone_number?: string
  status: 'active' | 'inactive'
}

export interface LoginCredentials {
  email: string;
  password: string;
}