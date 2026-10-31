import type {
  CreateApplicationInput,
  CreateCustomerInput,
  Customer,
  LoanApplication,
  PaginationQuery,
  UpdateApplicationStatusInput,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_KEY = import.meta.env.VITE_API_KEY

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
        ...(options?.headers ?? {}),
      },
    })
  } catch (error) {
    if (isAbortError(error) || options?.signal?.aborted) {
      throw error instanceof Error ? error : new DOMException('Request aborted', 'AbortError')
    }
    throw new ApiError('Unable to connect to the BestBank API. Check the network and API configuration.', 0)
  }

  if (!response.ok) {
    let message = ''

    try {
      const payload = await response.json() as { detail?: string | Array<{ msg?: string }> }

      if (typeof payload.detail === 'string') {
        message = payload.detail
      } else if (Array.isArray(payload.detail)) {
        message = payload.detail.map((item) => item.msg).filter(Boolean).join(', ')
      }
    } catch {
      message = ''
    }

    if (!message) {
      message = response.status === 401
        ? 'Authentication is required or the API key is invalid.'
        : `Request failed with status ${response.status}`
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function paginationQuery(query?: PaginationQuery) {
  if (!query) return ''
  const params = new URLSearchParams()
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  if (query.offset !== undefined) params.set('offset', String(query.offset))
  const value = params.toString()
  return value ? `?${value}` : ''
}

export const api = {
  getCustomers: (query?: PaginationQuery, signal?: AbortSignal) =>
    request<Customer[]>(`/customers${paginationQuery(query)}`, { signal }),
  getCustomer: (customerId: string, signal?: AbortSignal) =>
    request<Customer>(`/customers/${customerId}`, { signal }),
  createCustomer: (payload: CreateCustomerInput, signal?: AbortSignal) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal,
    }),
  getApplications: (query?: PaginationQuery, signal?: AbortSignal) =>
    request<LoanApplication[]>(`/applications${paginationQuery(query)}`, { signal }),
  getApplication: (applicationId: string, signal?: AbortSignal) =>
    request<LoanApplication>(`/applications/${applicationId}`, { signal }),
  createApplication: (payload: CreateApplicationInput) =>
    request<LoanApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateApplicationStatus: (
    applicationId: string,
    payload: UpdateApplicationStatusInput,
    signal?: AbortSignal,
  ) =>
    request<LoanApplication>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      signal,
    }),
}
