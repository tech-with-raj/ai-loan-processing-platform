import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { WorkflowMonitoring } from '../components/WorkflowMonitoring'
import { WorkflowControls } from '../components/WorkflowControls'

export function AgentOperationsPage() {
  return (
    <>
      <PageHeader eyebrow="Agent operations" title="Agent Operations" />
      <section className="agent-overview-metrics" aria-label="Agent workflow metrics unavailable">
        <Alert tone="warning">
          Operational metrics are unavailable. BestBank will not display total, running, completed, failed, or human-review workflow counts until backed by a workflow API.
        </Alert>
      </section>
      <WorkflowMonitoring />
      <Card title={<h3>Execution Controls</h3>}>
        <WorkflowControls />
      </Card>
      <Card title={<h3>Human Oversight</h3>}>
        <p>Consequential loan decisions remain in the existing human-review workflow.</p>
        <Link className="secondary-button" to="/review">Open human review queue</Link>
      </Card>
    </>
  )
}
