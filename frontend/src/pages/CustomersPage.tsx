import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { StateMessage } from '../components/StateMessage'
import { Button } from '../components/Button'
import { Input } from '../components/FormControls'
import { SearchInput } from '../components/SearchInput'
import { Pagination } from '../components/Pagination'
import { useOperations } from '../hooks/useOperations'
import { api } from '../services/api'

export function CustomersPage() {
  const {
    customers,
    applications,
    customersLoading,
    customersError,
    refresh,
  } = useOperations()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const normalized = query.trim().toLowerCase()
  const filtered = useMemo(() => customers.filter((customer) => !normalized || [
    customer.name,
    customer.email,
    customer.phone ?? '',
    customer.customer_id,
  ].join(' ').toLowerCase().includes(normalized)), [customers, normalized])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setFormError('')
    setSuccess('')
    try {
      const customer = await api.createCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      })
      setForm({ name: '', email: '', phone: '' })
      setSuccess(`Customer ${customer.name} created successfully.`)
      await refresh()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create the customer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Customer operations" title="Customers" />
      <div className="panel-grid customer-grid">
        <Card
          className="large-panel"
          title={<h3>Customer Directory</h3>}
          actions={
            <SearchInput
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search customers"
              aria-label="Search customers"
            />
          }
        >
          {customersLoading ? (
            <StateMessage>Loading customers...</StateMessage>
          ) : customersError ? (
            <StateMessage tone="error">{customersError}</StateMessage>
          ) : visible.length === 0 ? (
            <StateMessage>No customers match your search.</StateMessage>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Applications</th><th>Created</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {visible.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone ?? 'Not provided'}</td>
                      <td>{applications.filter((item) => item.customer_id === customer.customer_id).length}</td>
                      <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                      <td><Button variant="ghost" onClick={() => navigate(`/customers/${customer.customer_id}`)}>View</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </Card>
        <Card title={<h3>Create Customer</h3>}>
          <form className="application-form" onSubmit={submit}>
            <Input label="Full Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required maxLength={100} />
            <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            <Input label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} maxLength={20} />
            {formError ? <StateMessage tone="error">{formError}</StateMessage> : null}
            {success ? <StateMessage tone="success">{success}</StateMessage> : null}
            <Button type="submit" fullWidth disabled={submitting}>{submitting ? 'Creating...' : 'Create customer'}</Button>
          </form>
        </Card>
      </div>
    </>
  )
}
