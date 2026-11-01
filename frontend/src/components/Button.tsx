import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  fullWidth?: boolean
  loading?: boolean
  loadingText?: string
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  loadingText,
  className = '',
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button-${variant}${fullWidth ? ' button-full' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled || loading}
      aria-busy={loading || props['aria-busy'] || undefined}
      {...props}
    >
      {loading ? <span className="button-spinner" aria-hidden="true" /> : null}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  )
}
