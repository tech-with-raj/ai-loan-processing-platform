import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

export interface FormControlProps {
  label: string
  hint?: string
  error?: string
  className?: string
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FormControlProps {}
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FormControlProps {}
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FormControlProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label,
  hint,
  error,
  className = '',
  id,
  ...props
}, ref) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label className={`form-field ${className}`} htmlFor={inputId}>
      <span className="form-label">{label}</span>
      <input
        {...props}
        ref={ref}
        id={inputId}
        aria-label={label}
        className="form-control"
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${inputId}-help` : undefined}
      />
      {error ? <span id={`${inputId}-help`} className="form-error" role="alert">{error}</span>
        : hint ? <span id={`${inputId}-help`} className="form-hint">{hint}</span> : null}
    </label>
  )
})

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({
  label,
  hint,
  error,
  className = '',
  id,
  children,
  ...props
}, ref) {
  const selectId = id ?? `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label className={`form-field ${className}`} htmlFor={selectId}>
      <span className="form-label">{label}</span>
      <select
        {...props}
        ref={ref}
        id={selectId}
        aria-label={label}
        className="form-control"
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${selectId}-help` : undefined}
      >
        {children}
      </select>
      {error ? <span id={`${selectId}-help`} className="form-error" role="alert">{error}</span>
        : hint ? <span id={`${selectId}-help`} className="form-hint">{hint}</span> : null}
    </label>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  label,
  hint,
  error,
  className = '',
  id,
  ...props
}, ref) {
  const textareaId = id ?? `textarea-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label className={`form-field ${className}`} htmlFor={textareaId}>
      <span className="form-label">{label}</span>
      <textarea
        {...props}
        ref={ref}
        id={textareaId}
        aria-label={label}
        className="form-control"
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${textareaId}-help` : undefined}
      />
      {error ? <span id={`${textareaId}-help`} className="form-error" role="alert">{error}</span>
        : hint ? <span id={`${textareaId}-help`} className="form-hint">{hint}</span> : null}
    </label>
  )
})
