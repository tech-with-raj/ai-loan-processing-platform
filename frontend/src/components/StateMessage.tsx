import type { ReactNode } from 'react'
import { Alert } from './Alert'

interface StateMessageProps {
  children: ReactNode
  tone?: 'info' | 'error' | 'success'
}

export function StateMessage({ children, tone = 'info' }: StateMessageProps) {
  return <Alert tone={tone}>{children}</Alert>
}
