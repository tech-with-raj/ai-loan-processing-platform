import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api } from '../services/api'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('API client', () => {
  it('returns successful JSON responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, [{ customer_id: 'c1' }])))

    await expect(api.getCustomers()).resolves.toEqual([{ customer_id: 'c1' }])
  })

  it('reports network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(api.getCustomers()).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining('Unable to connect'),
    })
  })

  it('reports HTTP 401 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { detail: 'Invalid or missing API key' })))

    await expect(api.getApplications()).rejects.toMatchObject<Pick<ApiError, 'status' | 'message'>>({
      status: 401,
      message: 'Invalid or missing API key',
    })
  })

  it('reports FastAPI HTTP 422 validation details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(422, {
      detail: [{ msg: 'loan_amount: ensure this value is greater than 0' }],
    })))

    await expect(api.createApplication({
      customer_id: 'c1',
      loan_type: 'Personal Loan',
      loan_amount: '0',
    })).rejects.toMatchObject<Pick<ApiError, 'status' | 'message'>>({
      status: 422,
      message: expect.stringContaining('loan_amount'),
    })
  })

  it('creates customers through the centralized client', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(201, {
      customer_id: 'c1',
      name: 'Test Customer',
      email: 'test@example.com',
      phone: null,
      created_at: '2026-01-01T00:00:00Z',
    })))

    await expect(api.createCustomer({
      name: 'Test Customer',
      email: 'test@example.com',
      phone: null,
    })).resolves.toMatchObject({ customer_id: 'c1' })
  })

  it('updates application status through the centralized client', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, {
      application_id: 'a1',
      customer_id: 'c1',
      loan_type: 'Personal Loan',
      loan_amount: '50000.00',
      status: 'DOCUMENTS_PENDING',
      created_at: '2026-01-01T00:00:00Z',
    })))

    await expect(api.updateApplicationStatus('a1', { status: 'DOCUMENTS_PENDING' }))
      .resolves.toMatchObject({ status: 'DOCUMENTS_PENDING' })
  })

  it('does not claim document listing or download success while integration is pending', async () => {
    await expect(api.getDocuments('a1')).rejects.toMatchObject({
      status: 501,
      message: expect.stringContaining('pending backend integration'),
    })
    await expect(api.downloadDocument('a1', 'd1')).rejects.toMatchObject({
      status: 501,
      message: expect.stringContaining('pending backend integration'),
    })
  })

  it('reports a document upload HTTP failure safely', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(422, {
      detail: [{ msg: 'file: unsupported media type' }],
    })))

    await expect(api.uploadDocument('a1', new File(['pdf'], 'statement.pdf', { type: 'application/pdf' })))
      .rejects.toMatchObject({
        status: 422,
        message: expect.stringContaining('unsupported media type'),
      })
  })
})
