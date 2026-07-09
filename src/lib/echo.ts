import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { getAuthToken } from '@/api/token'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

let echoInstance: Echo<'reverb'> | null = null

function parseApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:80/api/v1'
  return new URL(apiUrl)
}

function buildBroadcastAuthEndpoint(apiUrl: URL): string {
  const apiPath = apiUrl.pathname.replace(/\/$/, '')
  return `${apiUrl.origin}${apiPath}/broadcasting/auth`
}

export function getEchoInstance(): Echo<'reverb'> | null {
  return echoInstance
}

export function connectEcho(): Echo<'reverb'> | null {
  const token = getAuthToken()

  if (!token) {
    return null
  }

  if (echoInstance) {
    return echoInstance
  }

  const apiUrl = parseApiUrl()
  const defaultHost = apiUrl.hostname
  const defaultScheme = apiUrl.protocol.replace(':', '') as 'http' | 'https'
  const envScheme = import.meta.env.VITE_REVERB_SCHEME as 'http' | 'https' | undefined
  const scheme = envScheme ?? defaultScheme
  const isSecure = scheme === 'https'

  const envPort = Number(import.meta.env.VITE_REVERB_PORT)
  const defaultPort = isSecure ? 443 : 80
  const wsPort = Number.isFinite(envPort) && envPort > 0 ? envPort : defaultPort

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? defaultHost,
    wsPort,
    wssPort: wsPort,
    forceTLS: isSecure,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: buildBroadcastAuthEndpoint(apiUrl),
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  return echoInstance
}

export function disconnectEcho(): void {
  if (!echoInstance) {
    return
  }

  echoInstance.disconnect()
  echoInstance = null
}
