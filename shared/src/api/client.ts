import { getAccessToken } from '../session'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiResponse<T> {
  data: T
  status: number
}

interface RequestOptions {
  skipAuthRefresh?: boolean
  responseType?: 'json' | 'blob' | 'text'
}

let apiBaseUrl = ''

export class ApiRequestError extends Error {
  readonly status: number
  readonly responseBody: unknown

  constructor(
    status: number,
    responseBody: unknown,
  ) {
    super(`Request failed with status ${status}`)
    this.name = 'ApiRequestError'
    this.status = status
    this.responseBody = responseBody
  }
}

/** Configures the origin used by native clients. The web app keeps same-origin requests. */
export function setApiBaseUrl(url: string | undefined) {
  apiBaseUrl = (url ?? '').replace(/\/$/, '')
}

export function getApiBaseUrl() {
  return apiBaseUrl
}

async function parseResponse<T>(response: Response, responseType: RequestOptions['responseType'] = 'json'): Promise<ApiResponse<T>> {
  if (response.status === 204) {
    return { data: undefined as T, status: response.status }
  }

  if (responseType === 'blob') {
    return {
      data: (await response.blob()) as T,
      status: response.status,
    }
  }

  if (responseType === 'text') {
    return {
      data: (await response.text()) as T,
      status: response.status,
    }
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return {
      data: (await response.json()) as T,
      status: response.status,
    }
  }

  return {
    data: (await response.text()) as T,
    status: response.status,
  }
}

function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${apiBaseUrl}/api${path}`
}

async function request<T>(method: HttpMethod, path: string, body?: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getAccessToken()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const responseBody = await parseResponse<unknown>(response).then((result) => result.data).catch(() => null)
    throw new ApiRequestError(response.status, responseBody)
  }

  return parseResponse<T>(response, options.responseType)
}

const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>('GET', path, undefined, options)
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('POST', path, body, options)
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PUT', path, body, options)
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PATCH', path, body, options)
  },
  delete<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('DELETE', path, body, options)
  },
}

export { apiClient }
export default apiClient
