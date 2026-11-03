export type ProposedWorkflowState =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'WAITING_FOR_HUMAN_REVIEW'
  | 'CANCELLED'

export interface ProposedWorkflowSummary {
  workflow_id: string
  application_id?: string
  workflow_type: string
  state: ProposedWorkflowState
  started_at?: string
  completed_at?: string
  duration_ms?: number
  current_task?: string
  failure?: {
    message?: string
    code?: string
  }
  human_intervention_required?: boolean
}

export interface ProposedWorkflowEvent {
  event_id: string
  event_type:
    | 'WORKFLOW_STARTED'
    | 'TASK_SELECTED'
    | 'TOOL_INVOCATION_REQUESTED'
    | 'TOOL_EXECUTION_COMPLETED'
    | 'EVALUATION_COMPLETED'
    | 'POLICY_CHECK_PERFORMED'
    | 'RETRY_REQUESTED'
    | 'HUMAN_ESCALATION_REQUESTED'
    | 'WORKFLOW_COMPLETED'
    | 'WORKFLOW_FAILED'
  occurred_at: string
  description?: string
}

export interface ProposedWorkflowTask {
  task_id: string
  task_name: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  input_summary?: string
  output_summary?: string
  result?: string
  error?: string
}

export interface ProposedToolInvocation {
  invocation_id: string
  tool_name: string
  description?: string
  status: 'REQUESTED' | 'EXECUTING' | 'EXECUTED' | 'FAILED' | 'BLOCKED' | 'CANCELLED'
  input_summary?: string
  output_summary?: string
  duration_ms?: number
  error?: string
}

export interface ProposedPolicyCheck {
  check_id: string
  name: string
  status: 'PASSED' | 'FAILED' | 'REQUIRES_HUMAN_APPROVAL' | 'BLOCKED'
  message?: string
}

export interface ProposedWorkflowExecution {
  workflow: ProposedWorkflowSummary
  events: ProposedWorkflowEvent[]
  tasks: ProposedWorkflowTask[]
  tool_invocations: ProposedToolInvocation[]
  policy_checks: ProposedPolicyCheck[]
  escalation?: {
    status: string
    reason?: string
    unresolved_issues?: string[]
    application_id?: string
  }
}
