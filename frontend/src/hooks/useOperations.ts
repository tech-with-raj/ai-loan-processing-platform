import { useContext } from 'react'
import { OperationsContext } from '../context/operations-context'

export function useOperations() {
  const context = useContext(OperationsContext)
  if (!context) {
    throw new Error('useOperations must be used within OperationsProvider')
  }
  return context
}
