import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <header className="topbar">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
      </div>
      {actions ? <div className="topbar-actions">{actions}</div> : null}
    </header>
  )
}
