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
import { DocumentProcessingOverview } from '../components/DocumentProcessingOverview'
import { ExtractionResults } from '../components/ExtractionResults'
import { ConfidenceIndicator } from '../components/ConfidenceIndicator'
import { ValidationFindings } from '../components/ValidationFindings'
import { HumanVerificationPanel } from '../components/HumanVerificationPanel'
import { ProcessingTimeline } from '../components/ProcessingTimeline'
import { AiDocumentProcessing } from '../components/AiDocumentProcessing'
import { DocumentList } from '../components/DocumentList'
import { DocumentStatusBadge } from '../components/DocumentStatusBadge'
import { DocumentManager } from '../components/DocumentManager'
import { HumanDecisionPanel } from '../components/HumanDecisionPanel'
import { HumanReviewNotes } from '../components/HumanReviewNotes'
import { ReviewHistory } from '../components/ReviewHistory'
import { WorkflowExecutionTimeline } from '../components/WorkflowExecutionTimeline'
import { ToolExecutionDetails } from '../components/ToolExecutionDetails'
import { PolicySafetyVisibility } from '../components/PolicySafetyVisibility'
import { WorkflowControls } from '../components/WorkflowControls'

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

describe('AI document processing components', () => {
  it('renders disconnected processing and loading states', () => {
    const { rerender } = render(<DocumentProcessingOverview />)
    expect(screen.getByText('AI processing not connected')).toBeTruthy()
    expect(screen.getByText(/awaiting backend integration/i)).toBeTruthy()

    rerender(<DocumentProcessingOverview loading />)
    expect(screen.getByText(/Loading AI processing status/i)).toBeTruthy()
  })

  it('renders processing overview data supplied only by test fixtures', () => {
    render(
      <DocumentProcessingOverview processing={{
        document_id: 'test-document-1',
        processing_status: 'VALIDATION_REQUIRED',
        processing_stage: 'Human review',
        last_processed_at: '2026-11-01T00:00:00Z',
        extraction_available: true,
        validation_status: 'REQUIRES_HUMAN_REVIEW',
        human_review_required: true,
      }} />,
    )

    expect(screen.getByText('VALIDATION REQUIRED')).toBeTruthy()
    expect(screen.getAllByText('Human review').length).toBeGreaterThan(0)
    expect(screen.getByText('Available')).toBeTruthy()
    expect(screen.getByText('REQUIRES HUMAN REVIEW')).toBeTruthy()
    expect(screen.getByText('Required')).toBeTruthy()
  })

  it('renders only returned extracted sections and missing field states', () => {
    render(
      <ExtractionResults sections={[{
        title: 'Customer Information',
        fields: [
          { label: 'Full name', value: 'Test Customer', confidence: 0.92, source: 'Test OCR fixture', validationStatus: 'VALID', humanVerificationStatus: 'CONFIRMED' },
          { label: 'Date of birth', value: null, validationStatus: 'MISSING' },
        ],
      }]} />,
    )

    expect(screen.getByText('Customer Information')).toBeTruthy()
    expect(screen.getByText('Test Customer')).toBeTruthy()
    expect(screen.getByText('Missing')).toBeTruthy()
    expect(screen.getByText('92% confidence')).toBeTruthy()
    expect(screen.getByText(/Human verification: CONFIRMED/i)).toBeTruthy()

    render(<ExtractionResults sections={[]} />)
    expect(screen.getByText('No extracted information available')).toBeTruthy()
  })

  it('shows unavailable and bounded confidence indicators without implying correctness', () => {
    const { rerender } = render(<ConfidenceIndicator />)
    expect(screen.getByText('Confidence unavailable')).toBeTruthy()
    rerender(<ConfidenceIndicator score={1.4} />)
    expect(screen.getByLabelText(/confidence 100 percent/i)).toBeTruthy()
  })

  it('renders validation origins and categories separately', () => {
    render(
      <ValidationFindings findings={[
        { finding_id: 'finding-1', origin: 'AI_EXTRACTION', category: 'REQUIRES_HUMAN_REVIEW', message: 'Test fixture requires review', field: 'Document number' },
        { finding_id: 'finding-2', origin: 'RULE_BASED_VALIDATION', category: 'EXPIRED', message: 'Test fixture is expired', field: 'Expiry date' },
      ]} />,
    )
    expect(screen.getByText('REQUIRES HUMAN REVIEW')).toBeTruthy()
    expect(screen.getByText('AI EXTRACTION')).toBeTruthy()
    expect(screen.getByText('RULE BASED VALIDATION')).toBeTruthy()
    expect(screen.getByText('Test fixture requires review')).toBeTruthy()
  })

  it('validates human correction fields without saving', async () => {
    const user = userEvent.setup()
    render(<HumanVerificationPanel fields={[{ label: 'Full name', value: null }]} />)
    await user.click(screen.getByRole('button', { name: 'Save correction (pending)' }))
    expect(screen.getByText(/Complete all editable fields/i)).toBeTruthy()

    await user.type(screen.getByLabelText('Full name'), 'Corrected Test Name')
    await user.click(screen.getByRole('button', { name: 'Save correction (pending)' }))
    expect(screen.getByText(/cannot be saved until an authorized backend endpoint/i)).toBeTruthy()
  })

  it('renders actual supplied processing timeline events and empty state', () => {
    const { rerender } = render(<ProcessingTimeline />)
    expect(screen.getByText('No processing history available')).toBeTruthy()

    rerender(<ProcessingTimeline events={[
      { event_id: 'event-1', type: 'DOCUMENT_UPLOADED', occurred_at: '2026-11-01T00:00:00Z', description: 'Test uploaded event' },
      { event_id: 'event-2', type: 'HUMAN_VERIFICATION_COMPLETED', occurred_at: '2026-11-01T01:00:00Z' },
    ]} />)
    expect(screen.getByText('DOCUMENT UPLOADED')).toBeTruthy()
    expect(screen.getByText('HUMAN VERIFICATION COMPLETED')).toBeTruthy()
    expect(screen.getByText('Test uploaded event')).toBeTruthy()
  })

  it('renders an error state and the full disconnected AI foundation', () => {
    render(<AiDocumentProcessing error="Unable to load proposed processing data." />)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Unable to load proposed processing data.')).toBeTruthy()
    expect(screen.getByText('Extracted Information')).toBeTruthy()
    expect(screen.getByText('Validation Findings')).toBeTruthy()
    expect(screen.getByText('Human Verification')).toBeTruthy()
  })
})

describe('Human review components', () => {
  it('renders human decisions separately from advisory AI guidance', () => {
    render(
      <HumanDecisionPanel
        applicationStatus="CREATED"
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    )
    expect(screen.getByText(/Human decision authority/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Approve' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: /Request additional information/i }).hasAttribute('disabled')).toBe(true)
    expect(screen.queryByText(/approved successfully/i)).not.toBeTruthy()
  })

  it('requires decision confirmation before a connected callback runs', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    render(
      <HumanDecisionPanel
        applicationStatus="REVIEW"
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onApprove).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Confirm approve' }))
    expect(onApprove).toHaveBeenCalledOnce()
  })

  it('shows review notes and audit integration as disconnected', () => {
    render(
      <>
        <HumanReviewNotes />
        <ReviewHistory />
      </>,
    )
    expect(screen.getByRole('button', { name: /Save review notes/i }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByText(/Review-note persistence is not connected/i)).toBeTruthy()
    expect(screen.getByText(/Review audit history pending/i)).toBeTruthy()
  })
})

describe('Agent workflow components', () => {
  it('renders disconnected and empty workflow states', () => {
    render(<WorkflowExecutionTimeline />)
    expect(screen.getByText(/No workflow execution events/i)).toBeTruthy()

    render(<ToolExecutionDetails />)
    expect(screen.getByText(/Tool invocation and execution data/i)).toBeTruthy()
  })

  it('distinguishes requested tool invocations from confirmed execution', () => {
    render(
      <ToolExecutionDetails invocations={[
        {
          invocation_id: 'test-tool-request-1',
          tool_name: 'Test document lookup',
          status: 'REQUESTED',
        },
        {
          invocation_id: 'test-tool-result-1',
          tool_name: 'Test document lookup',
          status: 'EXECUTED',
          output_summary: 'Test-only mocked backend output',
          duration_ms: 125,
        },
      ]} />,
    )
    expect(screen.getAllByText('REQUESTED').length).toBeGreaterThan(0)
    expect(screen.getByText(/execution is not confirmed/i)).toBeTruthy()
    expect(screen.getAllByText('EXECUTED').length).toBeGreaterThan(0)
    expect(screen.getByText(/Test-only mocked backend output/i)).toBeTruthy()
  })

  it('renders policy results and unsupported workflow controls honestly', () => {
    render(
      <>
        <PolicySafetyVisibility checks={[
          { check_id: 'test-policy-1', name: 'Test policy check', status: 'REQUIRES_HUMAN_APPROVAL', message: 'Test fixture data only' },
        ]} />
        <WorkflowControls />
      </>,
    )
    expect(screen.getByText(/Policy-bounded agent actions/i)).toBeTruthy()
    expect(screen.getByText('Test policy check')).toBeTruthy()
    expect(screen.getByText(/REQUIRES HUMAN APPROVAL/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Start workflow/i }).hasAttribute('disabled')).toBe(true)
    expect(screen.queryByText(/workflow started successfully/i)).not.toBeTruthy()
  })
})
