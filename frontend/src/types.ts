export interface Customer {
  customer_id: string
  name: string
  email: string
  phone: string
  created_at: string
}

export interface LoanApplication {
  application_id: string
  customer_id: string
  loan_type: string
  loan_amount: number
  status: string
  created_at: string
}

export interface CreateApplicationInput {
  customer_id: string
  loan_type: string
  loan_amount: number
}
