import type {
  CreateApplicationInput,
  CreateCustomerInput,
  Customer,
  LoanApplication,
  PaginationQuery,
  UpdateApplicationStatusInput,
  LoanDocument,
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
  const multipartBody = options?.body instanceof FormData
  const providedHeaders = options?.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : options?.headers && !(options.headers instanceof Array)
      ? options.headers as Record<string, string>
      : {}

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
        ...(!multipartBody ? { 'Content-Type': 'application/json' } : {}),
        ...providedHeaders,
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
  getDocuments: (_applicationId: string, _signal?: AbortSignal) =>
    Promise.reject<LoanDocument[]>(
      new ApiError('Document listing is pending backend integration.', 501),
    ),
  uploadDocument: (applicationId: string, file: File, signal?: AbortSignal) => {
    const formData = new FormData()
    formData.append('file', file, file.name)
    return request<LoanDocument>(`/applications/${applicationId}/documents`, {
      method: 'POST',
      body: formData,
      signal,
      headers: {},
    })
  },
  downloadDocument: (_applicationId: string, _documentId: string) =>
    Promise.reject(
      new ApiError('Authorized document download is pending backend integration.', 501),
    ),
  getProposedDocumentProcessing: (_applicationId: string, _documentId: string, _signal?: AbortSignal) =>
    Promise.reject(
      new ApiError('AI document processing integration is pending backend implementation.', 501),
    ),
  saveProposedHumanCorrections: (_applicationId: string, _documentId: string, _corrections: unknown, _signal?: AbortSignal) =>
    Promise.reject(
      new ApiError('Human correction integration is pending backend authorization.', 501),
    ),
}
