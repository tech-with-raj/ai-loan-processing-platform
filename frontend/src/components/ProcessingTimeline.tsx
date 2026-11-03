import type { ProposedProcessingEvent } from '../types'
import { EmptyState } from './FeedbackStates'

interface ProcessingTimelineProps {
  events?: ProposedProcessingEvent[]
}

export function ProcessingTimeline({ events = [] }: ProcessingTimelineProps) {
  if (events.length === 0) {
    return <EmptyState title="No processing history available">Actual processing events will appear here when supplied by the backend.</EmptyState>
  }

  return (
    <ol className="processing-timeline" aria-label="Document processing history">
      {events.map((event) => (
        <li key={event.event_id}>
          <strong>{event.type.replaceAll('_', ' ')}</strong>
          <time dateTime={event.occurred_at}>{new Date(event.occurred_at).toLocaleString()}</time>
          {event.description ? <p>{event.description}</p> : null}
        </li>
      ))}
    </ol>
  )
}
