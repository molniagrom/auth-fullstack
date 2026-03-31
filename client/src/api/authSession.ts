let accessToken = ''

export function setAccessToken(nextAccessToken: string) {
  accessToken = nextAccessToken
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = ''
}
