import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function Card({ title, actions, children, className = '', ...props }: CardProps) {
  return (
    <section className={`card ${className}`} {...props}>
      {title ? (
        <header className="card-header">
          <div>{title}</div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
