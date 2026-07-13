import axios, { type AxiosRequestConfig } from 'axios'
import { getAuthToken, clearAuthToken } from './token'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:80/api/v1'

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

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

export function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function request<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
  const res = await http.request<T>({ url: path, ...options })
  return res.data
}

export async function requestData<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
  const res = await request<{ data: T }>(path, options)
  return res.data
}
