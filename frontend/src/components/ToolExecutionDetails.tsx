import { Alert } from './Alert'
import type { ProposedToolInvocation } from '../contracts/agentWorkflows'

interface ToolExecutionDetailsProps {
  invocations?: ProposedToolInvocation[]
}

export function ToolExecutionDetails({ invocations }: ToolExecutionDetailsProps) {
  if (!invocations?.length) {
    return <Alert tone="warning">Tool invocation and execution data is not available.</Alert>
  }

  return (
    <div className="tool-execution-list">
      {invocations.map((invocation) => (
        <article className="tool-execution-card" key={invocation.invocation_id}>
          <div className="tool-execution-heading">
            <strong>{invocation.tool_name}</strong>
            <span>{invocation.status}</span>
          </div>
          {invocation.description ? <p>{invocation.description}</p> : null}
          {invocation.status === 'REQUESTED' ? (
            <Alert tone="info">This tool was requested but its execution is not confirmed.</Alert>
          ) : null}
          {invocation.input_summary ? <dl><dt>Input summary</dt><dd>{invocation.input_summary}</dd></dl> : null}
          {invocation.output_summary ? <dl><dt>Output summary</dt><dd>{invocation.output_summary}</dd></dl> : null}
          {invocation.duration_ms !== undefined ? <p>Duration: {invocation.duration_ms} ms</p> : null}
          {invocation.error ? <Alert tone="error">{invocation.error}</Alert> : null}
        </article>
      ))}
    </div>
  )
}
