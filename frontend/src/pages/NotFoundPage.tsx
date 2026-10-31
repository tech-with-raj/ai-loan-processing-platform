import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

export function NotFoundPage() {
  return (
    <>
      <PageHeader eyebrow="Navigation" title="Page Not Found" />
      <section className="panel">
        <p>The requested BestBank page does not exist.</p>
        <Link className="secondary-button" to="/">Return to dashboard</Link>
      </section>
    </>
  )
}
