import type { ProposedExtractedField } from '../types'
import { Badge } from './Badge'
import { ConfidenceIndicator } from './ConfidenceIndicator'

interface ExtractedFieldProps {
  field: ProposedExtractedField
}

export function ExtractedField({ field }: ExtractedFieldProps) {
  const displayedValue = field.value === null || field.value === undefined || field.value === ''
    ? 'Missing'
    : String(field.value)
  const validation = field.validationStatus?.replaceAll('_', ' ') ?? 'Not validated'
  const verification = field.humanVerificationStatus?.replaceAll('_', ' ') ?? 'Unverified'

  return (
    <div className="extracted-field">
      <div className="extracted-field-heading">
        <strong>{field.label}</strong>
        {field.validationStatus === 'VALID' ? <Badge tone="success">{validation}</Badge>
          : field.validationStatus === 'INVALID' || field.validationStatus === 'MISSING' ? <Badge tone="danger">{validation}</Badge>
            : <Badge tone="neutral">{validation}</Badge>}
      </div>
      <span className="extracted-field-value">{displayedValue}</span>
      <div className="extracted-field-meta">
        <ConfidenceIndicator score={field.confidence} />
        {field.source ? <span>Source: {field.source}</span> : null}
        <span>Human verification: {verification}</span>
      </div>
    </div>
  )
}
