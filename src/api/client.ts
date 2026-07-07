import type { User } from '../types/user'
import { mockUsers } from './mockData'
import type { Product } from '../types/product'
import { mockProducts } from './mockProducts'
import type { Person, Message } from '../types/chat'
import { mockPeople, mockMessages } from './mockChat'
interface AuthResponse {
  token: string
}
import type { LoginCredentials } from '../types/user'




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

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK) return delay(mockProducts)
  return request<Product[]>('/products')
}

export async function getPeople(): Promise<Person[]> {
  if (USE_MOCK) return delay(mockPeople)
  return request<Person[]>('/people')
}

export async function getMessages(personId: number): Promise<Message[]> {
  if (USE_MOCK) {
    return delay(mockMessages.filter((m) => m.personId === personId))
  }
  return request<Message[]>(`/people/${personId}/messages`)
}

export async function sendMessage(personId: number, text: string): Promise<Message> {
  const newMessage: Message = {
    id: Date.now(),
    personId,
    text,
    fromMe: true,
    time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
  }
  if (USE_MOCK) {
    mockMessages.push(newMessage)
    return delay(newMessage)
  }
  return request<Message>(`/people/${personId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export async function createProduct(payload: Omit<Product, 'id'>): Promise<Product> {
  if (USE_MOCK) {
    const newProduct: Product = { id: Date.now(), ...payload }
    mockProducts.push(newProduct)
    return delay(newProduct)
  }
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProductStock(id: number, stock: number): Promise<Product> {
  if (USE_MOCK) {
    const product = mockProducts.find((p) => p.id === id)
    if (product) product.stock = stock
    return delay(product as Product)
  }
  return request<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  })
}

export async function deleteProduct(id: number): Promise<void> {
  if (USE_MOCK) {
    const idx = mockProducts.findIndex((p) => p.id === id)
    if (idx !== -1) mockProducts.splice(idx, 1)
    return delay(undefined)
  }
  await request<void>(`/products/${id}`, {method: 'DELETE'})
}

export async function login(payload: LoginCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}


