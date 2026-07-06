import type { User } from '../types/user'
import { mockUsers } from './mockData'

// --- Configuration -----------------------------------------------------
// Set VITE_USE_MOCK=false in .env once the Laravel API is reachable.
// Nothing else in the app needs to change - every screen just calls the
// functions below (getUsers, getUser, ...), never fetch() directly.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

// Simulates real network latency so loading states get tested honestly.
function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

// --- Public API ----------------------------------------------------------
// Add one function per endpoint here. Each one has a mock branch and a
// real branch - swap USE_MOCK and every screen keeps working unchanged.

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) return delay(mockUsers)
  return request<User[]>('/users')
}

export async function getUser(id: number): Promise<User | undefined> {
  if (USE_MOCK) return delay(mockUsers.find((u) => u.id === id))
  return request<User>(`/users/${id}`)
}

export async function createUser(payload: Omit<User, 'id'>): Promise<User> {
  if (USE_MOCK) {
    const newUser: User = { id: Date.now(), ...payload }
    mockUsers.push(newUser)
    return delay(newUser)
  }
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
