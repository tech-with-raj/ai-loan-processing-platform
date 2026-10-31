import { useState } from 'react'
import { Alert } from './Alert'
import { Button } from './Button'
import { Input } from './FormControls'
import type { ProposedExtractedField } from '../types'

interface HumanVerificationPanelProps {
  fields?: ProposedExtractedField[]
}

export function HumanVerificationPanel({ fields = [] }: HumanVerificationPanelProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [validationMessage, setValidationMessage] = useState('')

  if (fields.length === 0) {
    return <Alert tone="warning">Human correction is awaiting backend integration and no editable fields are available.</Alert>
  }

  const submit = () => {
    const missing = fields.filter((field) => !String(values[field.label] ?? field.value ?? '').trim())
    if (missing.length > 0) {
      setValidationMessage(`Complete all editable fields. Missing: ${missing.map((field) => field.label).join(', ')}`)
      return
    }
    setValidationMessage('Corrections cannot be saved until an authorized backend endpoint confirms them.')
  }

  return (
    <form className="human-verification-panel" onSubmit={(event) => { event.preventDefault(); submit() }}>
      {fields.map((field) => (
        <Input
          key={field.label}
          label={field.label}
          value={values[field.label] ?? (field.value === null ? '' : String(field.value))}
          onChange={(event) => setValues((current) => ({ ...current, [field.label]: event.target.value }))}
          hint="Review against the source document. A correction is not verification."
        />
      ))}
      <div className="human-verification-actions">
        <Button type="submit">Save correction (pending)</Button>
        <Button type="button" variant="secondary">Request confirmation (pending)</Button>
      </div>
      {validationMessage ? <Alert tone="warning">{validationMessage}</Alert> : null}
    </form>
  )
}
