import { createContext } from 'react'
import type { Customer, LoanApplication } from '../types'

export interface OperationsContextValue {
  customers: Customer[]
  applications: LoanApplication[]
  customersLoading: boolean
  applicationsLoading: boolean
  customersError: string
  applicationsError: string
  refresh: () => Promise<void>
}

export const OperationsContext = createContext<OperationsContextValue | null>(null)
