import { useState } from 'react'
import { Alert } from './Alert'
import { Button } from './Button'
import { Textarea } from './FormControls'

export function HumanReviewNotes() {
  const [observations, setObservations] = useState('')
  const [error, setError] = useState('')

  return (
    <div className="human-review-notes">
      <Textarea
        label="Reviewer observations"
        value={observations}
        onChange={(event) => setObservations(event.target.value)}
        hint="Record operational observations; saving is unavailable."
      />
      <Textarea label="Identified discrepancies" disabled hint="Requires a review-notes backend endpoint." />
      <Textarea label="Additional information required" disabled hint="Requires a review-notes backend endpoint." />
      <Textarea label="Suggested follow-up actions" disabled hint="Requires a review-notes backend endpoint." />
      <Button disabled onClick={() => {
        if (!observations.trim()) setError('Enter at least one reviewer observation.')
      }}>
        Save review notes — unavailable
      </Button>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Alert tone="warning">
        Review-note persistence is not connected. This interface does not save, submit, or claim successful review-note changes.
      </Alert>
    </div>
  )
}
