import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from '../components/Alert'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EmptyState, ErrorState } from '../components/FeedbackStates'
import { Input, Select, Textarea } from '../components/FormControls'

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
