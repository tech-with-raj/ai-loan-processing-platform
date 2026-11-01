import { Alert } from './Alert'
import { Card } from './Card'
import { SearchInput } from './SearchInput'
import { Select } from './FormControls'
import { StateMessage } from './StateMessage'

export function WorkflowMonitoring() {
  return (
    <Card
      className="workflow-monitoring-card"
      title={<h3>Workflow Monitoring</h3>}
      actions={
        <div className="workflow-monitoring-controls">
          <SearchInput disabled showLabel label="Search workflows" placeholder="Search unavailable" />
          <Select disabled label="Workflow state" value="UNAVAILABLE">
            <option value="UNAVAILABLE">Unavailable without backend data</option>
          </Select>
        </div>
      }
    >
      <StateMessage tone="error">
        Workflow monitoring is pending backend integration. No workflow executions are displayed because the workflow API does not exist.
      </StateMessage>
      <Alert tone="info">
        Supported states will be added only from the backend contract: pending, running, completed, failed, waiting for human review, and cancelled.
      </Alert>
    </Card>
  )
}
