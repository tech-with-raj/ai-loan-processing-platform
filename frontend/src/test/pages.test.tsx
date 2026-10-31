import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { OperationsProvider } from '../context/OperationsContext'
import { AppShell } from '../layout/AppShell'
import { ApplicationDetailPage } from '../pages/ApplicationDetailPage'
import { ApplicationsPage } from '../pages/ApplicationsPage'
import { CustomersPage } from '../pages/CustomersPage'
import { CustomerDetailPage } from '../pages/CustomerDetailPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HumanReviewQueuePage } from '../pages/HumanReviewQueuePage'
import { ApplicationReviewWorkspacePage } from '../pages/ApplicationReviewWorkspacePage'
import { AgentOperationsPage } from '../pages/AgentOperationsPage'
import { WorkflowExecutionPage } from '../pages/WorkflowExecutionPage'

const customer = {
  customer_id: '11111111-1111-4111-8111-111111111111',
  name: 'Test Customer',
  email: 'test@example.com',
  phone: null,
  created_at: '2026-01-01T00:00:00Z',
}

const application = {
  application_id: '22222222-2222-4222-8222-222222222222',
  customer_id: customer.customer_id,
  loan_type: 'Personal Loan',
  loan_amount: '50000.00',
  status: 'CREATED',
  created_at: '2026-01-02T00:00:00Z',
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mockOperations() {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/applications') && init?.method === 'POST') return jsonResponse(201, application)
    if (url.endsWith(`/applications/${application.application_id}`)) return jsonResponse(200, application)
    if (url.includes('/applications')) return jsonResponse(200, [application])
    if (url.endsWith(`/customers/${customer.customer_id}`)) return jsonResponse(200, customer)
    if (url.includes('/customers')) return jsonResponse(200, [customer])
    return jsonResponse(404, { detail: 'Not found' })
  }))
}

function renderWithOperations(ui: React.ReactNode, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <OperationsProvider>{ui}</OperationsProvider>
    </MemoryRouter>,
  )
}

describe('Frontend pages', () => {
  it('lists customers and loaded application counts', async () => {
    mockOperations()
    renderWithOperations(<CustomersPage />)

    expect(await screen.findByRole('cell', { name: 'Test Customer' })).toBeTruthy()
    expect(screen.queryByText(/loaded/i)).not.toBeTruthy()
  })

  it('paginates a complete customer dataset and handles empty searches', async () => {
    const customersPage = Array.from({ length: 12 }, (_, index) => ({
      ...customer,
      customer_id: `${index}-customer`,
      name: `Customer ${index + 1}`,
    }))
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/customers')) return jsonResponse(200, customersPage)
      if (url.includes('/applications')) return jsonResponse(200, [])
      return jsonResponse(404, { detail: 'Not found' })
    }))
    renderWithOperations(<CustomersPage />, '/customers')

    expect(await screen.findByRole('cell', { name: 'Customer 1' })).toBeTruthy()
    expect(screen.getByText('Page 1 of 2')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('cell', { name: 'Customer 11' })).toBeTruthy()
    expect(screen.queryByRole('cell', { name: 'Customer 1' })).not.toBeTruthy()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search customers' }), {
      target: { value: 'no matching customer' },
    })
    expect(await screen.findByText('No customers match your search.')).toBeTruthy()
  })

  it('creates a customer and refreshes the directory', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/customers') && init?.method === 'POST') return jsonResponse(201, customer)
      if (url.endsWith('/customers')) return jsonResponse(200, [customer])
      if (url.includes('/applications')) return jsonResponse(200, [])
      return jsonResponse(404, { detail: 'Not found' })
    }))
    renderWithOperations(<CustomersPage />, '/customers')

    fireEvent.change(await screen.findByLabelText('Full Name'), { target: { value: 'Test Customer' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create customer' }))

    expect(await screen.findByText(/Customer Test Customer created successfully/i)).toBeTruthy()
  })

  it('retrieves a customer detail record and its loaded associated applications', async () => {
    mockOperations()
    render(
      <MemoryRouter initialEntries={[`/customers/${customer.customer_id}`]}>
        <OperationsProvider>
          <Routes>
            <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Test Customer' })).toBeTruthy()
    expect(screen.getByText(/Associated Loan Applications/i)).toBeTruthy()
  })

  it('lists applications', async () => {
    mockOperations()
    renderWithOperations(<ApplicationsPage />, '/applications')

    expect(await screen.findByRole('cell', { name: 'Personal Loan' })).toBeTruthy()
  })

  it('paginates applications across all pages and restores a valid page after filtering', async () => {
    const applicationsPage = Array.from({ length: 12 }, (_, index) => ({
      ...application,
      application_id: `application-${index + 1}`,
      loan_type: index >= 10 ? 'Home Loan' : 'Personal Loan',
      created_at: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
    }))
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/applications')) return jsonResponse(200, applicationsPage)
      if (url.includes('/customers')) return jsonResponse(200, [customer])
      return jsonResponse(404, { detail: 'Not found' })
    }))
    renderWithOperations(<ApplicationsPage />, '/applications')

    expect(await screen.findByText('Page 1 of 2')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Sort'), { target: { value: 'oldest' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(screen.getByText('Page 2 of 2')).toBeTruthy()
      expect(screen.getAllByRole('cell', { name: 'Home Loan' })).toHaveLength(2)
    })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search applications' }), {
      target: { value: 'does-not-exist' },
    })
    expect(await screen.findByText('No applications match your current filter.')).toBeTruthy()
  })

  it('creates an application and navigate to its detail route', async () => {
    mockOperations()
    renderWithOperations(
      <Routes>
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:applicationId" element={<ApplicationDetailPage />} />
      </Routes>,
      '/applications',
    )

    await screen.findAllByText('Test Customer')
    fireEvent.change(screen.getByLabelText(/loan amount/i), { target: { value: '75000.00' } })
    fireEvent.change(screen.getByLabelText(/customer/i), { target: { value: customer.customer_id } })
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }))

    await waitFor(() => {
      expect(screen.getByText(/application details|Application 22222222/i)).toBeTruthy()
    })
  })

  it('directly retrieves application details by route ID', async () => {
    mockOperations()
    render(
      <MemoryRouter initialEntries={[`/applications/${application.application_id}`]}>
        <OperationsProvider>
          <Routes>
            <Route path="/applications/:applicationId" element={<ApplicationDetailPage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Personal Loan/i)).toBeTruthy()
    expect(screen.getByText('Test Customer')).toBeTruthy()
  })

  it('does not allow approve or reject actions from the general application detail', async () => {
    const reviewApplication = { ...application, status: 'REVIEW' }
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith(`/applications/${reviewApplication.application_id}`)) return jsonResponse(200, reviewApplication)
      if (url.endsWith(`/customers/${customer.customer_id}`)) return jsonResponse(200, customer)
      if (url.includes('/applications')) return jsonResponse(200, [reviewApplication])
      if (url.includes('/customers')) return jsonResponse(200, [customer])
      return jsonResponse(404, { detail: 'Not found' })
    }))

    render(
      <MemoryRouter initialEntries={[`/applications/${reviewApplication.application_id}`]}>
        <OperationsProvider>
          <Routes>
            <Route path="/applications/:applicationId" element={<ApplicationDetailPage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'Open human review workspace' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeTruthy()
    expect(screen.queryByRole('button', { name: /Move to APPROVED/i })).not.toBeTruthy()
    expect(screen.queryByRole('button', { name: /Move to REJECTED/i })).not.toBeTruthy()
  })

  it('distinguishes a missing customer from a customer request failure and offers recovery', async () => {
    const missingCustomerApplication = { ...application, customer_id: 'missing-customer' }
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith(`/applications/${missingCustomerApplication.application_id}`)) return jsonResponse(200, missingCustomerApplication)
      if (url.includes('/customers/missing-customer')) return jsonResponse(404, { detail: 'Customer not found' })
      return jsonResponse(404, { detail: 'Not found' })
    }))

    render(
      <MemoryRouter initialEntries={[`/applications/${missingCustomerApplication.application_id}`]}>
        <OperationsProvider>
          <Routes>
            <Route path="/applications/:applicationId" element={<ApplicationDetailPage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Customer record not found.')).toBeTruthy()
    expect(screen.queryByText(/Unknown customer/i)).not.toBeTruthy()
  })

  it('clears an old detail response when navigating between application IDs', async () => {
    const secondApplication = {
      ...application,
      application_id: '33333333-3333-4333-8333-333333333333',
      loan_type: 'Home Loan',
    }
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith(`/applications/${secondApplication.application_id}`)) {
        return jsonResponse(200, secondApplication)
      }
      if (url.endsWith(`/applications/${application.application_id}`)) {
        return jsonResponse(200, application)
      }
      if (url.endsWith(`/customers/${customer.customer_id}`)) {
        return jsonResponse(200, customer)
      }
      return jsonResponse(404, { detail: 'Not found' })
    }))

    render(
      <MemoryRouter initialEntries={[`/applications/${application.application_id}`]}>
        <OperationsProvider>
          <Link to={`/applications/${secondApplication.application_id}`}>Open second application</Link>
          <Routes>
            <Route path="/applications/:applicationId" element={<ApplicationDetailPage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Personal Loan/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Open second application' }))

    expect(await screen.findByText(/Home Loan/i)).toBeTruthy()
    expect(screen.queryByText(/Personal Loan/i)).not.toBeTruthy()
  })

  it('shows application detail not-found errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { detail: 'Loan application not found' })))
    render(
      <MemoryRouter initialEntries={['/applications/missing-id']}>
        <OperationsProvider>
          <Routes>
            <Route path="/applications/:applicationId" element={<ApplicationDetailPage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Application not found.')).toBeTruthy()
  })

  it('shows loading and network error states', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/applications')) {
        throw new TypeError('Failed to fetch')
      }
      return jsonResponse(200, [customer])
    }))
    renderWithOperations(<DashboardPage />)

    expect(await screen.findByRole('alert')).toBeTruthy()
  })

  it('renders AppShell navigation and planned module labels', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<div>Dashboard screen</div>} />
            <Route path="customers" element={<div>Customers screen</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeTruthy()
    expect(screen.getAllByText('Planned').length).toBeGreaterThan(0)
  })

  it('keeps closed mobile navigation out of keyboard focus and restores focus on Escape', async () => {
    const mediaQuery = {
      matches: true,
      media: '(max-width: 1024px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<div>Dashboard screen</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const sidebar = container.querySelector('#mobile-navigation')
    const menuButton = screen.getByRole('button', { name: 'Menu' })
    expect(sidebar?.hasAttribute('inert')).toBe(true)
    expect(sidebar?.getAttribute('aria-hidden')).toBe('true')

    await userEvent.click(menuButton)
    expect(menuButton.getAttribute('aria-expanded')).toBe('true')
    expect(sidebar?.hasAttribute('inert')).toBe(false)
    expect(sidebar?.hasAttribute('aria-hidden')).toBe(false)

    await userEvent.keyboard('{Escape}')
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    await waitFor(() => expect(document.activeElement).toBe(menuButton))
  })

  it('renders the review queue empty state without inferred reviewer assignment', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/applications')) return jsonResponse(200, [])
      if (url.includes('/customers')) return jsonResponse(200, [])
      return jsonResponse(404, { detail: 'Not found' })
    }))
    renderWithOperations(<HumanReviewQueuePage />, '/review')

    expect(await screen.findByText(/No applications currently have the backend/i)).toBeTruthy()
    expect(screen.getByText(/review assignment API is not available/i)).toBeTruthy()
    expect(screen.queryByText(/assigned to reviewer/i)).not.toBeTruthy()
  })

  it('renders review queue applications with backend REVIEW status', async () => {
    const reviewApplication = { ...application, status: 'REVIEW' }
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/applications')) return jsonResponse(200, [reviewApplication])
      if (url.includes('/customers')) return jsonResponse(200, [customer])
      return jsonResponse(404, { detail: 'Not found' })
    }))
    renderWithOperations(<HumanReviewQueuePage />, '/review')

    expect(await screen.findByRole('cell', { name: 'Personal Loan' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'View' })).toBeTruthy()
  })

  it('renders application review workspace evidence and disconnected review operations', async () => {
    const reviewApplication = { ...application, status: 'REVIEW' }
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith(`/applications/${reviewApplication.application_id}`)) return jsonResponse(200, reviewApplication)
      if (url.endsWith(`/customers/${customer.customer_id}`)) return jsonResponse(200, customer)
      if (url.includes('/applications')) return jsonResponse(200, [reviewApplication])
      if (url.includes('/customers')) return jsonResponse(200, [customer])
      return jsonResponse(404, { detail: 'Not found' })
    }))
    render(
      <MemoryRouter initialEntries={[`/applications/${reviewApplication.application_id}/review`]}>
        <OperationsProvider>
          <Routes>
            <Route path="/applications/:applicationId/review" element={<ApplicationReviewWorkspacePage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Application 22222222/i)).toBeTruthy()
    expect(screen.getByText('Test Customer')).toBeTruthy()
    expect(screen.getByText(/No documents uploaded/i)).toBeTruthy()
    expect(screen.getByText(/AI processing not connected/i)).toBeTruthy()
    expect(screen.getByText(/Human Review Notes/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Request additional information/i }).hasAttribute('disabled')).toBe(true)
  })

  it('keeps review customer request failures distinct and retries customer loading', async () => {
    const reviewApplication = { ...application, status: 'REVIEW' }
    let customerRequestCount = 0
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith(`/applications/${reviewApplication.application_id}`)) return jsonResponse(200, reviewApplication)
      if (url.endsWith(`/customers/${customer.customer_id}`)) {
        customerRequestCount += 1
        if (customerRequestCount === 1) return jsonResponse(503, { detail: 'Customer service unavailable' })
        return jsonResponse(200, customer)
      }
      if (url.includes('/applications')) return jsonResponse(200, [reviewApplication])
      if (url.includes('/customers')) return jsonResponse(200, [customer])
      return jsonResponse(404, { detail: 'Not found' })
    }))

    render(
      <MemoryRouter initialEntries={[`/applications/${reviewApplication.application_id}/review`]}>
        <OperationsProvider>
          <Routes>
            <Route path="/applications/:applicationId/review" element={<ApplicationReviewWorkspacePage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Customer information could not be loaded: Customer service unavailable/i)).toBeTruthy()
    expect(screen.queryByText(/Unknown customer/i)).not.toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Retry customer information' }))
    expect(await screen.findByText('Test Customer')).toBeTruthy()
  })

  it('persists a confirmed decision only through the backend status endpoint', async () => {
    const reviewApplication = { ...application, status: 'REVIEW' }
    const approvedApplication = { ...reviewApplication, status: 'APPROVED' }
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/status') && init?.method === 'PATCH') return jsonResponse(200, approvedApplication)
      if (url.endsWith(`/applications/${reviewApplication.application_id}`)) return jsonResponse(200, reviewApplication)
      if (url.endsWith(`/customers/${customer.customer_id}`)) return jsonResponse(200, customer)
      if (url.includes('/applications')) return jsonResponse(200, [reviewApplication])
      if (url.includes('/customers')) return jsonResponse(200, [customer])
      return jsonResponse(404, { detail: 'Not found' })
    }))
    render(
      <MemoryRouter initialEntries={[`/applications/${reviewApplication.application_id}/review`]}>
        <OperationsProvider>
          <Routes>
            <Route path="/applications/:applicationId/review" element={<ApplicationReviewWorkspacePage />} />
          </Routes>
        </OperationsProvider>
      </MemoryRouter>,
    )

    await screen.findByRole('button', { name: 'Approve' })
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm approve' }))

    expect(await screen.findByText(/Backend confirmed the application status as APPROVED/i)).toBeTruthy()
  })

  it('renders agent operations without fabricated workflow metrics', () => {
    render(
      <MemoryRouter initialEntries={['/agent-operations']}>
        <Routes>
          <Route path="/agent-operations" element={<AgentOperationsPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Agent Operations' })).toBeTruthy()
    expect(screen.getByText(/Operational metrics are unavailable/i)).toBeTruthy()
    expect(screen.getByText(/Workflow monitoring is pending backend integration/i)).toBeTruthy()
    expect(screen.queryByText(/12 running/i)).not.toBeTruthy()
  })

  it('renders workflow execution detail and human escalation as disconnected', () => {
    render(
      <MemoryRouter initialEntries={['/workflows/test-workflow-1']}>
        <Routes>
          <Route path="/workflows/:workflowId" element={<WorkflowExecutionPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText(/Workflow execution test-workflow-1/i)).toBeTruthy()
    expect(screen.getByText(/Workflow execution data is not connected/i)).toBeTruthy()
    expect(screen.getByText(/No workflow execution events/i)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Human Escalation' })).toBeTruthy()
    expect(screen.getByText(/Human escalation details are pending backend integration/i)).toBeTruthy()
  })
})
