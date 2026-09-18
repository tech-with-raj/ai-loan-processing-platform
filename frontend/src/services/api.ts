import type { CreateApplicationInput, Customer, LoanApplication } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  getCustomers: () => request<Customer[]>('/customers'),
  getApplications: () => request<LoanApplication[]>('/applications'),
  createApplication: (payload: CreateApplicationInput) =>
    request<LoanApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
