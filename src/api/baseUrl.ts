const DEFAULT_API_URL = 'http://localhost:80/api'

export function getApiBaseUrl(): string {
  const baseUrl = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '')
  const version = (import.meta.env.VITE_API_VERSION ?? 'v1').replace(/^\/+|\/+$/g, '')

  if (!version || baseUrl.endsWith(`/${version}`)) return baseUrl
  return `${baseUrl}/${version}`
}
