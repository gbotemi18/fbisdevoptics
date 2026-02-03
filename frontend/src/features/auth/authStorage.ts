export type AuthUser = {
  id: string
  fullName: string
  email: string
  role: string
}

type AuthPayload = {
  user: AuthUser
  token: string
}

const TOKEN_KEY = 'fbisdevoptics.token'
const USER_KEY = 'fbisdevoptics.user'

export function saveAuth(payload: AuthPayload) {
  localStorage.setItem(TOKEN_KEY, payload.token)
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as AuthUser) : null
}
