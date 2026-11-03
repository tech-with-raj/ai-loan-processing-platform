import type { ProposedValidationFinding } from '../types'
import { Badge } from './Badge'
import { EmptyState } from './FeedbackStates'

interface ValidationFindingsProps {
  findings?: ProposedValidationFinding[]
}

export function ValidationFindings({ findings = [] }: ValidationFindingsProps) {
  if (findings.length === 0) {
    return (
      <EmptyState title="No validation findings returned">
        This state does not mean validation passed. Results are unavailable until backend validation is connected.
      </EmptyState>
    )
  }

  return (
    <div className="validation-findings">
      {findings.map((finding) => (
        <article className="validation-finding" key={finding.finding_id}>
          <div>
            <Badge tone={finding.category === 'VALID' ? 'success' : finding.category === 'INCONSISTENT' || finding.category === 'EXPIRED' ? 'warning' : 'danger'}>
              {finding.category.replaceAll('_', ' ')}
            </Badge>
            <span className="validation-origin">{finding.origin.replaceAll('_', ' ')}</span>
          </div>
          <strong>{finding.field || 'Document finding'}</strong>
          <p>{finding.message}</p>
        </article>
      ))}
    </div>
  )
}
