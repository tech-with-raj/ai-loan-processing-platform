export interface ProposedReviewNote {
  application_id: string
  observations: string
  discrepancies?: string
  additional_information_required?: string
  suggested_follow_up_actions?: string
}

export interface ProposedHumanDecision {
  application_id: string
  decision: 'APPROVED' | 'REJECTED' | 'REQUEST_ADDITIONAL_INFORMATION' | 'ESCALATED'
  confirmed: boolean
  comments?: string
}

export interface ProposedReviewHistoryEvent {
  event_id: string
  event_type: 'REVIEW_STARTED' | 'COMMENT_ADDED' | 'DECISION_RECORDED' | 'ESCALATION_RECORDED' | 'ADDITIONAL_INFORMATION_REQUESTED'
  occurred_at: string
  actor_id?: string
  description?: string
}
