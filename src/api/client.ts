import axios, { type AxiosRequestConfig } from 'axios'
import type { CreateUserPayload, LoginCredentials, User } from '../types/user'
import type { Product } from '../types/product'
import type { Conversation, Message } from '../types/chat'
import { mockConversations, mockMessages } from './mockChat'
import type { Order, PaginatedResponse } from '@/types/order'

// --- Configuration -----------------------------------------------------
// Set VITE_USE_MOCK=false in .env once the Laravel API is reachable.
// Nothing else in the app needs to change - every screen just calls the
// functions below (getUsers, getUser, ...), never axios directly.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:80/api'
const AUTH_TOKEN_KEY = 'auth_token'

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthToken()
      window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

// Simulates real network latency so loading states get tested honestly.
function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

async function request<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
  const res = await http.request<T>({ url: path, ...options })
  return res.data
}

async function requestData<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
  const res = await request<{ data: T }>(path, options)
  return res.data
}

// --- Public API ----------------------------------------------------------
// Add one function per endpoint here. Each one has a mock branch and a
// real branch - swap USE_MOCK and every screen keeps working unchanged.

export async function getUsers(): Promise<User[]> {
  return requestData<User[]>('/v1/admin/users')
}

export async function getUser(id: number): Promise<User | undefined> {
  return requestData<User>(`/v1/admin/users/${id}`)
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  return requestData<User>('/v1/admin/users', {
    method: 'POST',
    data: payload,
  })
}

export async function deactivateUser(id: number): Promise<void> {
  await request<void>(`/v1/admin/users/${id}`, { method: 'DELETE' })
}

export async function reactivateUser(id: number): Promise<User> {
  return requestData<User>(`/v1/admin/users/${id}`, {
    method: 'PUT',
    data: { is_active: true },
  })
}

export async function getProducts(): Promise<Product[]> {
  const products = await requestData<Product[]>('/v1/admin/products')
  return products.map((product) => ({
    ...product,
    price: Number(product.price),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      stock_quantity: Number(variant.stock_quantity),
    })),
  }))
}

export async function getConversations(): Promise<Conversation[]> {
  return delay(mockConversations)
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  return delay(mockMessages.filter((m) => m.conversation_id === conversationId))
}

export async function sendMessage(conversationId: number, senderId: number, message: string): Promise<Message> {
  const newMessage: Message = {
    id: Date.now(),
    conversation_id: conversationId,
    sender_id: senderId,
    message,
    sent_at: new Date().toISOString(),
  }
  mockMessages.push(newMessage)
  return delay(newMessage)
}

export async function createProduct(payload: Partial<Product> & Pick<Product, 'name' | 'price'>): Promise<Product> {
  return requestData<Product>('/v1/admin/products', {
    method: 'POST',
    data: payload,
  })
}

export async function updateVariantStock(productId: number, variantId: number, stockQuantity: number): Promise<Product> {
  return requestData<Product>(`/v1/admin/products/${productId}/variants/${variantId}`, {
    method: 'PATCH',
    data: { stock_quantity: stockQuantity },
  })
}

export async function deleteProduct(id: number): Promise<void> {
  await request<void>(`/v1/admin/products/${id}`, { method: 'DELETE' })
}

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

export async function getOrders(page = 1): Promise<PaginatedResponse<Order>> {
  return request<PaginatedResponse<Order>>(`/v1/admin/orders?page=${page}`)
}

