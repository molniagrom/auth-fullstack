export type AuthUser = {
  id: string
  email: string
}

type AuthSessionState = {
  accessToken: string
  user: AuthUser | null
}

let authSessionState: AuthSessionState = {
  accessToken: '',
  user: null,
}

const listeners = new Set<() => void>()

export function setAuthenticatedSession(nextSession: AuthSessionState) {
  authSessionState = nextSession
  emitChange()
}

export function updateAuthenticatedUser(user: AuthUser | null) {
  authSessionState = {
    ...authSessionState,
    user,
  }
  emitChange()
}

export function getAccessToken() {
  return authSessionState.accessToken
}

export function getAuthSession() {
  return authSessionState
}

export function clearAuthSession() {
  authSessionState = {
    accessToken: '',
    user: null,
  }
  emitChange()
}

export function subscribeToAuthSession(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}
