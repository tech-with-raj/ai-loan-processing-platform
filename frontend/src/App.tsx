import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { OperationsProvider } from './context/OperationsContext'
import { AppShell } from './layout/AppShell'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { CustomersPage } from './pages/CustomersPage'
import { CustomerDetailPage } from './pages/CustomerDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import { DisconnectedPage } from './pages/DisconnectedPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SettingsPage } from './pages/SettingsPage'
import { HumanReviewQueuePage } from './pages/HumanReviewQueuePage'
import { ApplicationReviewWorkspacePage } from './pages/ApplicationReviewWorkspacePage'

function AppRoutes() {
  return (
    <OperationsProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/:applicationId" element={<ApplicationDetailPage />} />
          <Route
            path="documents"
            element={
              <DisconnectedPage
                eyebrow="Document operations"
                title="Documents"
                description="Document upload and retrieval are planned. The backend document endpoints and secure storage integration are not implemented yet."
              />
            }
          />
          <Route
            path="review"
            element={<HumanReviewQueuePage />}
          />
          <Route path="applications/:applicationId/review" element={<ApplicationReviewWorkspacePage />} />
          <Route
            path="ai-insights"
            element={
              <DisconnectedPage
                eyebrow="Decision support"
                title="AI Insights"
                description="AI recommendations are planned. BestBank does not currently expose models, scores, predictions, or automated decisions."
              />
            }
          />
          <Route
            path="activity"
            element={
              <DisconnectedPage
                eyebrow="Audit history"
                title="Activity & Audit"
                description="Read-only activity and audit history will be connected when backend audit events are implemented."
              />
            }
          />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </OperationsProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
