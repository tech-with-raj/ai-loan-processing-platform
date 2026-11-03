import { Alert } from './Alert'
import { Button } from './Button'

export function WorkflowControls() {
  return (
    <div className="workflow-controls">
      <div className="decision-actions">
        <Button disabled>Start workflow — unavailable</Button>
        <Button variant="secondary" disabled>Pause — unavailable</Button>
        <Button variant="secondary" disabled>Resume — unavailable</Button>
        <Button variant="secondary" disabled>Retry — unavailable</Button>
        <Button variant="secondary" disabled>Cancel — unavailable</Button>
        <Button variant="ghost" disabled>Escalate to human — unavailable</Button>
      </div>
      <Alert tone="warning">
        Workflow controls require verified backend endpoints, request schemas, authorization requirements, and policy validation.
        These controls do not modify workflow state locally.
      </Alert>
    </div>
  )
}
