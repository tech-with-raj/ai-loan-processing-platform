import { useId, type InputHTMLAttributes } from 'react'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showLabel?: boolean
}

export function SearchInput({ label = 'Search', showLabel = false, className = '', ...props }: SearchInputProps) {
  const generatedId = useId()
  const inputId = props.id ?? generatedId

  return (
    <label className={`search-field ${className}`} htmlFor={inputId}>
      <span className={showLabel ? 'form-label' : 'sr-only'}>{label}</span>
      <input {...props} id={inputId} type="search" className="form-control search-input" aria-label={props['aria-label'] ?? label} />
    </label>
  )
}
