import { Alert } from './Alert'
import type { ProposedWorkflowEvent } from '../contracts/agentWorkflows'

interface WorkflowExecutionTimelineProps {
  events?: ProposedWorkflowEvent[]
}

export function WorkflowExecutionTimeline({ events }: WorkflowExecutionTimelineProps) {
  if (!events?.length) {
    return <Alert tone="warning">No workflow execution events are available from the backend.</Alert>
  }

  return (
    <ol className="workflow-timeline" aria-label="Workflow execution timeline">
      {events.map((event) => (
        <li key={event.event_id}>
          <strong>{event.event_type.replaceAll('_', ' ')}</strong>
          <time dateTime={event.occurred_at}>{new Date(event.occurred_at).toLocaleString()}</time>
          {event.description ? <p>{event.description}</p> : null}
        </li>
      ))}
    </ol>
  )
}
