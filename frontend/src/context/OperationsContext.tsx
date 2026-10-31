import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../services/api'
import type { Customer, LoanApplication } from '../types'
import { OperationsContext } from './operations-context'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [customersError, setCustomersError] = useState('')
  const [applicationsError, setApplicationsError] = useState('')
  const refreshControllerRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    refreshControllerRef.current?.abort()
    const controller = new AbortController()
    refreshControllerRef.current = controller
    setCustomersLoading(true)
    setApplicationsLoading(true)
    setCustomersError('')
    setApplicationsError('')

    const [customerResult, applicationResult] = await Promise.allSettled([
      api.getCustomers({ limit: 100 }, controller.signal),
      api.getApplications({ limit: 100 }, controller.signal),
    ])

    if (controller.signal.aborted) return

    if (customerResult.status === 'fulfilled') {
      setCustomers(customerResult.value)
    } else {
      setCustomersError(errorMessage(customerResult.reason, 'Unable to load customers.'))
    }

    if (applicationResult.status === 'fulfilled') {
      setApplications(applicationResult.value)
    } else {
      setApplicationsError(errorMessage(applicationResult.reason, 'Unable to load applications.'))
    }

    setCustomersLoading(false)
    setApplicationsLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (active) {
        void refresh()
      }
    })
    return () => {
      active = false
      refreshControllerRef.current?.abort()
    }
  }, [refresh])

  const value = useMemo(
    () => ({
      customers,
      applications,
      customersLoading,
      applicationsLoading,
      customersError,
      applicationsError,
      refresh,
    }),
    [
      customers,
      applications,
      customersLoading,
      applicationsLoading,
      customersError,
      applicationsError,
      refresh,
    ],
  )

  return (
    <OperationsContext.Provider value={value}>
      {children}
    </OperationsContext.Provider>
  )
}
