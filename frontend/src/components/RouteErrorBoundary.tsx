import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { Card } from './Card'

interface RouteErrorBoundaryProps {
  children: ReactNode
}

interface RouteErrorBoundaryState {
  failed: boolean
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Deliberately do not log or expose rendering stack data.
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <Card className="route-error-boundary">
        <div role="alert" aria-live="assertive">
          <h1>Unable to display this page</h1>
          <p>The BestBank interface encountered an unexpected error. No sensitive error details are shown.</p>
          <div className="decision-actions">
            <Button type="button" onClick={() => window.location.reload()}>
              Reload page
            </Button>
            <Link className="secondary-button" to="/" onClick={() => this.setState({ failed: false })}>
              Return to dashboard
            </Link>
          </div>
        </div>
      </Card>
    )
  }
}
