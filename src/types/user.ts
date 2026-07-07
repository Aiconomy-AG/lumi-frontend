// Replace/extend this with whatever shape the Laravel API actually returns.
// Keeping it in one place means when the real contract lands, you only
// update it here and TypeScript will point out every place that breaks.
export interface User {
  id: number
  name: string
  email: string
  team: string
  role: 'admin' | 'member' | 'viewer'
  status: 'online' | 'offline'
}

export interface LoginCredentials {
  email: string;
  password: string;
}