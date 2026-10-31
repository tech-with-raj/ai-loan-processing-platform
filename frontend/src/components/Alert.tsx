import type { ReactNode } from 'react'

interface AlertProps {
  children: ReactNode
  tone?: 'info' | 'success' | 'error' | 'warning'
  title?: string
  announce?: boolean
}

export function Alert({ children, tone = 'info', title, announce = true }: AlertProps) {
  return (
    <div
      className={`alert alert-${tone}`}
      role={announce ? (tone === 'error' ? 'alert' : 'status') : undefined}
      aria-live={announce ? (tone === 'error' ? 'assertive' : 'polite') : undefined}
      aria-atomic="true"
    >
      {title ? <strong className="alert-title">{title}</strong> : null}
      <div>{children}</div>
    </div>
  )
}
