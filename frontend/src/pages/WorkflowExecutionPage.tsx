import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { WorkflowExecutionTimeline } from '../components/WorkflowExecutionTimeline'
import { ToolExecutionDetails } from '../components/ToolExecutionDetails'
import { PolicySafetyVisibility } from '../components/PolicySafetyVisibility'
import { WorkflowControls } from '../components/WorkflowControls'

export function WorkflowExecutionPage() {
  const { workflowId } = useParams()

  return (
    <>
      <PageHeader
        eyebrow="Agent workflow execution"
        title={workflowId ? `Workflow execution ${workflowId}` : 'Workflow execution'}
        actions={<Link className="secondary-button" to="/agent-operations">Back to operations</Link>}
      />
      <Card title={<h3>Workflow Overview</h3>}>
        <Alert tone="warning">
          Workflow execution data is not connected. No workflow ID record, application association, execution state, dates, outcome, or current task is being inferred.
        </Alert>
      </Card>
      <Card title={<h3>Execution Timeline</h3>}>
        <WorkflowExecutionTimeline />
      </Card>
      <Card title={<h3>Agent Task Details</h3>}>
        <Alert tone="warning">Task names, inputs, outputs, results, and errors are unavailable until an execution API exists.</Alert>
      </Card>
      <Card title={<h3>Tool Execution Details</h3>}>
        <ToolExecutionDetails />
      </Card>
      <Card title={<h3>Policy and Safety</h3>}>
        <PolicySafetyVisibility />
      </Card>
      <Card title={<h3>Human Escalation</h3>}>
        <Alert tone="warning">
          Human escalation details are pending backend integration. BestBank does not infer that this workflow is awaiting human review.
        </Alert>
        <Link className="secondary-button" to="/review">Open human review queue</Link>
      </Card>
      <Card title={<h3>Workflow Controls</h3>}>
        <WorkflowControls />
      </Card>
    </>
  )
}
