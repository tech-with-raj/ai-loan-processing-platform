import type { ReactNode } from 'react'

interface AlertProps {
  children: ReactNode
  tone?: 'info' | 'success' | 'error' | 'warning'
  title?: string
}

export function Alert({ children, tone = 'info', title }: AlertProps) {
  return (
    <div
      className={`alert alert-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      {title ? <strong className="alert-title">{title}</strong> : null}
      <div>{children}</div>
    </div>
  )
}
