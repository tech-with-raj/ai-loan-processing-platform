import { PageHeader } from '../components/PageHeader'
import { StateMessage } from '../components/StateMessage'
import { Card } from '../components/Card'

export function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="System" title="Settings" />
      <section className="panel-grid">
        <Card title={<h3>API Configuration</h3>}>
          <dl className="settings-list">
            <div><dt>API URL</dt><dd>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000 (default)'}</dd></div>
            <div><dt>API Key</dt><dd>{import.meta.env.VITE_API_KEY ? 'Configured' : 'Not configured'}</dd></div>
          </dl>
        </Card>
        <Card title={<h3>Authentication</h3>}>
          <StateMessage>Backend authentication and role-based authorization are not implemented.</StateMessage>
        </Card>
      </section>
    </>
  )
}
