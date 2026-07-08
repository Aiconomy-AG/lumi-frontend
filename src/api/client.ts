import axios, { type AxiosRequestConfig } from 'axios'
import type { User } from '../types/user'
import { mockUsers } from './mockData'
import type { Product } from '../types/product'
import { mockProducts } from './mockProducts'
import type { Conversation, Message } from '../types/chat'
import { mockConversations, mockMessages } from './mockChat'

// --- Configuration -----------------------------------------------------
// Set VITE_USE_MOCK=false in .env once the Laravel API is reachable.
// Nothing else in the app needs to change - every screen just calls the
// functions below (getUsers, getUser, ...), never axios directly.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Simulates real network latency so loading states get tested honestly.
function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

async function request<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
  const res = await http.request<T>({ url: path, ...options })
  return res.data
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
    data: payload,
  })
}

export async function deleteUser(id: number): Promise<void> {
  if (USE_MOCK) {
    const idx = mockUsers.findIndex((u) => u.id === id)
    if (idx !== -1) mockUsers.splice(idx, 1)
    return delay(undefined)
  }
  await request<void>(`/users/${id}`, { method: 'DELETE' })
}

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK) return delay(mockProducts)
  return request<Product[]>('/products')
}

export async function getConversations(): Promise<Conversation[]> {
  if (USE_MOCK) return delay(mockConversations)
  return request<Conversation[]>('/conversations')
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  if (USE_MOCK) {
    return delay(mockMessages.filter((m) => m.conversation_id === conversationId))
  }
  return request<Message[]>(`/conversations/${conversationId}/messages`)
}

export async function sendMessage(conversationId: number, senderId: number, message: string): Promise<Message> {
  const newMessage: Message = {
    id: Date.now(),
    conversation_id: conversationId,
    sender_id: senderId,
    message,
    sent_at: new Date().toISOString(),
  }
  if (USE_MOCK) {
    mockMessages.push(newMessage)
    return delay(newMessage)
  }
  return request<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    data: { message },
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
    data: payload,
  })
}

export async function updateVariantStock(productId: number, variantId: number, stockQuantity: number): Promise<Product> {
  if (USE_MOCK) {
    const product = mockProducts.find((p) => p.id === productId)
    const variant = product?.variants.find((v) => v.id === variantId)
    if (variant) variant.stock_quantity = stockQuantity
    return delay(product as Product)
  }
  return request<Product>(`/products/${productId}/variants/${variantId}`, {
    method: 'PATCH',
    data: { stock_quantity: stockQuantity },
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

