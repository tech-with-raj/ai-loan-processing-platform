import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { RouteErrorBoundary } from '../components/RouteErrorBoundary'

const navigation = [
  { label: 'Dashboard', path: '/', implemented: true },
  { label: 'Customers', path: '/customers', implemented: true },
  { label: 'Loan Applications', path: '/applications', implemented: true },
  { label: 'Documents', path: '/documents', implemented: false },
  { label: 'Review Queue', path: '/review', implemented: true },
  { label: 'Agent Operations', path: '/agent-operations', implemented: true },
  { label: 'AI Insights', path: '/ai-insights', implemented: false },
  { label: 'Activity & Audit', path: '/activity', implemented: false },
  { label: 'Settings', path: '/settings', implemented: true },
]

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 1024px)').matches
      : false,
  )
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(max-width: 1024px)')
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches)
    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)
    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    sidebarRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        window.requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          const mainContent = document.getElementById('main-content')
          mainContent?.focus()
          mainContent?.scrollIntoView?.()
        }}
      >
        Skip to main content
      </a>
      <aside
        ref={sidebarRef}
        id="mobile-navigation"
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        aria-hidden={isMobileViewport && !mobileOpen ? true : undefined}
        inert={isMobileViewport && !mobileOpen ? true : undefined}
      >
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">B</div>
          <div>
            <h2>BestBank</h2>
            <p>Loan Operations</p>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (isMobileViewport) {
                  setMobileOpen(false)
                  window.requestAnimationFrame(() => menuButtonRef.current?.focus())
                }
              }}
            >
              <span>{item.label}</span>
              {!item.implemented ? <span className="nav-status">Planned</span> : null}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="workspace">
        <header className="mobile-header">
          <button
            ref={menuButtonRef}
            className="secondary-button mobile-menu-button"
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((current) => !current)}
          >
            Menu
          </button>
          <strong>BestBank</strong>
        </header>
        <main id="main-content" className="content" tabIndex={-1}>
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  )
}
