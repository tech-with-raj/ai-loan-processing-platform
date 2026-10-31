import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from '../components/Alert'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EmptyState, ErrorState } from '../components/FeedbackStates'
import { Input, Select, Textarea } from '../components/FormControls'
import { DocumentUploader } from '../components/DocumentUploader'
import { MAX_DOCUMENT_SIZE_BYTES, validateDocumentFile } from '../utils/documentValidation'
import { DocumentList } from '../components/DocumentList'
import { DocumentStatusBadge } from '../components/DocumentStatusBadge'
import { DocumentManager } from '../components/DocumentManager'

describe('Shared design system components', () => {
  it('renders a button and handles interaction and disabled state', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Continue</Button>)

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onClick).toHaveBeenCalledOnce()

    rerender(<Button disabled>Continue</Button>)
    expect(screen.getByRole('button', { name: 'Continue' }).hasAttribute('disabled')).toBe(true)
  })

  it('connects input labels, hints, and validation errors', () => {
    render(<Input label="Email address" hint="Used for account updates" />)
    const input = screen.getByRole('textbox', { name: 'Email address' })
    expect(input.getAttribute('aria-describedby')).toContain('-help')
    expect(screen.getByText('Used for account updates')).toBeTruthy()

    render(<Input label="Phone" error="Phone is required" />)
    const invalidInput = screen.getByRole('textbox', { name: 'Phone' })
    expect(invalidInput.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toContain('Phone is required')
  })

  it('renders accessible select and textarea controls', () => {
    render(
      <>
        <Select label="Loan type">
          <option>Personal Loan</option>
        </Select>
        <Textarea label="Review notes" />
      </>
    )

    expect(screen.getByRole('combobox', { name: 'Loan type' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Review notes' })).toBeTruthy()
  })

  it('renders alert, badge, empty, and retryable error states', () => {
    const onRetry = vi.fn()
    render(
      <>
        <Alert tone="error">Unable to load records.</Alert>
        <Badge tone="success">Implemented</Badge>
        <EmptyState title="No customers found">Create a customer to continue.</EmptyState>
        <ErrorState onRetry={onRetry}>Network unavailable.</ErrorState>
      </>
    )

    expect(screen.getAllByRole('alert')[0].textContent).toContain('Unable to load records.')
    expect(screen.getByText('Implemented')).toBeTruthy()
    expect(screen.getByText('No customers found')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
  })
})

describe('Document management components', () => {
  it('validates document type and size', () => {
    expect(validateDocumentFile(new File(['pdf'], 'loan.pdf', { type: 'application/pdf' }))).toBeNull()
    expect(validateDocumentFile(new File(['text'], 'notes.txt', { type: 'text/plain' }))).toContain('PDF, JPEG, or PNG')
    expect(validateDocumentFile(new File([new Uint8Array(MAX_DOCUMENT_SIZE_BYTES + 1)], 'large.pdf', { type: 'application/pdf' }))).toContain('5 MB')
  })

  it('renders the uploader and selected file information', async () => {
    const user = userEvent.setup()
    render(<DocumentUploader applicationId="application-1" />)

    const input = screen.getByLabelText('Choose documents')
    const file = new File(['pdf'], 'statement.pdf', { type: 'application/pdf' })
    await user.upload(input, file)

    expect(screen.getByText('statement.pdf')).toBeTruthy()
    expect(screen.getByText(/application\/pdf/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeTruthy()
  })

  it('rejects duplicate selected files and invalid uploads', async () => {
    const user = userEvent.setup()
    render(<DocumentUploader applicationId="application-1" />)
    const input = screen.getByLabelText('Choose documents')
    const file = new File(['pdf'], 'statement.pdf', { type: 'application/pdf' })

    await user.upload(input, file)
    await user.upload(input, file)

    expect(screen.getAllByText('statement.pdf')).toHaveLength(1)
    expect(screen.getByText(/already been selected/i)).toBeTruthy()
  })

  it('shows pending feedback instead of submitting without backend integration', async () => {
    const user = userEvent.setup()
    render(<DocumentUploader applicationId="application-1" />)
    await user.upload(screen.getByLabelText('Choose documents'), new File(['pdf'], 'statement.pdf', { type: 'application/pdf' }))
    await user.click(screen.getByRole('button', { name: 'Upload' }))

    expect(screen.getByText(/pending backend integration/i)).toBeTruthy()
  })

  it('supports successful and failed upload callbacks and retry', async () => {
    const user = userEvent.setup()
    const upload = vi.fn()
      .mockRejectedValueOnce(new Error('Server validation failed'))
      .mockResolvedValueOnce({ document_id: 'd1' })
    render(<DocumentUploader applicationId="application-1" upload={upload} />)
    await user.upload(screen.getByLabelText('Choose documents'), new File(['pdf'], 'statement.pdf', { type: 'application/pdf' }))
    await user.click(screen.getByRole('button', { name: 'Upload' }))

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText(/uploaded successfully/i)).toBeTruthy()
    expect(upload).toHaveBeenCalledTimes(2)
  })

  it('renders all document statuses and an empty document list', () => {
    render(<DocumentList documents={[]} />)
    expect(screen.getByText('No documents uploaded')).toBeTruthy()

    const statuses = ['MISSING', 'UPLOADED', 'PROCESSING', 'PROCESSED', 'VALIDATION_REQUIRED', 'VALID', 'INVALID'] as const
    render(
      <>
        {statuses.map((status) => <DocumentStatusBadge key={status} status={status} />)}
      </>
    )
    for (const status of statuses) {
      expect(screen.getByLabelText(`Document status: ${status.replaceAll('_', ' ')}`)).toBeTruthy()
    }
  })

  it('renders application association and backend integration states', () => {
    render(<DocumentManager applicationId="application-1" loading />)
    expect(screen.getByText(/Backend integration pending/i)).toBeTruthy()
    expect(screen.getByText(/Loading documents/i)).toBeTruthy()
  })
})
