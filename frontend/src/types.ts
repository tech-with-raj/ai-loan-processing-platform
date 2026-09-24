export type ApplicationStatus =
  | 'CREATED'
  | 'DOCUMENTS_PENDING'
  | 'PROCESSING'
  | 'VALIDATION'
  | 'REVIEW'
  | 'APPROVED'
  | 'REJECTED'

export type LoanType = 'Personal Loan' | 'Home Loan' | 'Vehicle Loan' | 'Business Loan'

export interface Customer {
  customer_id: string
  name: string
  email: string
  phone: string | null
  created_at: string
}

export interface LoanApplication {
  application_id: string
  customer_id: string
  loan_type: LoanType
  loan_amount: string
  status: ApplicationStatus
  created_at: string
}

export interface CreateApplicationInput {
  customer_id: string
  loan_type: LoanType
  loan_amount: string
}
