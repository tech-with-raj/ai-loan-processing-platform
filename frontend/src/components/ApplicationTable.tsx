import type { Customer, LoanApplication } from '../types'
import { StatusBadge } from './StatusBadge'
import { Button } from './Button'

interface ApplicationTableProps {
  applications: LoanApplication[]
  customers: Customer[]
  onSelect: (applicationId: string) => void
  maxRows?: number
}

const formatCurrency = (amount: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount))

export function ApplicationTable({
  applications,
  customers,
  onSelect,
  maxRows,
}: ApplicationTableProps) {
  const visibleApplications = maxRows ? applications.slice(0, maxRows) : applications

  return (
    <div className="table-wrap">
      <table className="application-table">
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Customer</th>
            <th>Loan Type</th>
            <th className="numeric-column">Loan Amount</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visibleApplications.map((application) => {
            const customer = customers.find((item) => item.customer_id === application.customer_id)

            return (
              <tr key={application.application_id}>
                <td><span className="application-id">{application.application_id.slice(0, 8)}</span></td>
                <td>{customer?.name ?? 'Unknown customer'}</td>
                <td>{application.loan_type}</td>
                <td className="numeric-column">{formatCurrency(application.loan_amount)}</td>
                <td><StatusBadge status={application.status} /></td>
                <td>{new Date(application.created_at).toLocaleDateString()}</td>
                <td className="table-action-column">
                  <Button variant="ghost" onClick={() => onSelect(application.application_id)}>
                    View
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}