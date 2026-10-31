import type { HTMLAttributes, ReactNode } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
}

export function Badge({ children, tone = 'neutral', className = '', ...props }: BadgeProps) {
  return (
    <span className={`badge badge-${tone}${className ? ` ${className}` : ''}`} {...props}>
      {children}
    </span>
  )
}
