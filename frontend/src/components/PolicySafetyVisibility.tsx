import { Alert } from './Alert'
import type { ProposedPolicyCheck } from '../contracts/agentWorkflows'

interface PolicySafetyVisibilityProps {
  checks?: ProposedPolicyCheck[]
}

export function PolicySafetyVisibility({ checks }: PolicySafetyVisibilityProps) {
  return (
    <div className="policy-safety">
      <Alert tone="info" title="Policy-bounded agent actions">
        Agent actions are advisory and must remain restricted by backend policy and authorization enforcement.
        The frontend does not grant permissions or bypass policy checks.
      </Alert>
      {checks?.length ? (
        <ul className="policy-check-list">
          {checks.map((check) => (
            <li key={check.check_id}>
              <strong>{check.name}</strong>
              <span>{check.status.replaceAll('_', ' ')}</span>
              {check.message ? <p>{check.message}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <Alert tone="warning">No policy check results are available from the backend.</Alert>
      )}
    </div>
  )
}
