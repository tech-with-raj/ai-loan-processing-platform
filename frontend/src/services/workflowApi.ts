import { ApiError } from './api'

export const workflowApi = {
  getWorkflows: (_signal?: AbortSignal) =>
    Promise.reject(
      new ApiError('Agent workflow monitoring integration is pending backend implementation.', 501),
    ),
  getWorkflowExecution: (_workflowId: string, _signal?: AbortSignal) =>
    Promise.reject(
      new ApiError('Workflow execution details integration is pending backend implementation.', 501),
    ),
  startWorkflow: (_applicationId: string, _workflowType: string, _signal?: AbortSignal) =>
    Promise.reject(
      new ApiError('Workflow start integration is pending backend implementation.', 501),
    ),
  controlWorkflow: (_workflowId: string, _action: 'PAUSE' | 'RESUME' | 'RETRY' | 'CANCEL' | 'ESCALATE', _signal?: AbortSignal) =>
    Promise.reject(
      new ApiError(`Workflow ${_action.toLowerCase()} integration is pending backend implementation.`, 501),
    ),
}
