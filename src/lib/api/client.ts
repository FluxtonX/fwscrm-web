const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
export const API_BASE_URL = cleanBaseUrl.endsWith('/api')
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api`;

export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp?: string;
  path?: string;
}

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public errorData: ApiError,
  ) {
    const msg = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || 'An API error occurred';
    super(msg);
    this.name = 'ApiException';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensures HttpOnly auth cookies are sent across domains
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        statusCode: response.status,
        message: response.statusText || 'Unexpected server response',
      };
    }
    throw new ApiException(response.status, errorData);
  }

  // If 204 No Content, return undefined/empty object
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
