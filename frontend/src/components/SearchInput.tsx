import type { InputHTMLAttributes } from 'react'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function SearchInput({ label = 'Search', className = '', ...props }: SearchInputProps) {
  return (
    <label className={`search-field ${className}`}>
      <span className="sr-only">{label}</span>
      <input type="search" className="form-control search-input" {...props} />
    </label>
  )
}
