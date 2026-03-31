const apiBaseUrl = 'http://localhost:3001'

type ApiMessageResponse = {
  message?: string
}

export async function postJson<ResponseBody, RequestBody>(
  path: string,
  body: RequestBody,
): Promise<ResponseBody> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = (await response.json()) as ResponseBody & ApiMessageResponse

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.')
  }

  return data
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
