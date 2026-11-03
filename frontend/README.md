# BestBank Frontend

This frontend is a Vite + React + TypeScript application for the BestBank loan operations workflow.

## Tech stack
- React
- TypeScript
- Vite
- CSS Modules-style custom styling
- Fetch-based API client

## Project structure
- src/App.tsx — main dashboard and feature layout
- src/services/api.ts — centralized API client
- src/types.ts — matching TypeScript interfaces for backend data
- src/App.css — enterprise styling
- .env.example — environment configuration for backend URL

## Local setup
1. Open a terminal in the frontend folder.
2. Install dependencies:
   npm install
3. Create a local environment file if needed:
   cp .env.example .env
4. Update the backend URL if your FastAPI app is running on a different host/port.
5. Start the app:
   npm run dev -- --host 0.0.0.0

## Backend URL configuration
Set the backend URL in the frontend environment file:

VITE_API_BASE_URL=http://localhost:8000

This is used by the centralized API service in src/services/api.ts.

## API key and production security

Any environment variable prefixed with `VITE_` is compiled into the frontend bundle and is publicly accessible in browser developer tools. This is the reason `VITE_API_KEY` can continue to support local development but is not a production secret or security boundary.

The current backend optionally reads `API_KEY` from its server-side environment. If it is set, protected endpoints require the `X-API-Key` header to match that value. The FastAPI dependency returns HTTP 401 for a missing or invalid key. If `API_KEY` is unset, the backend dependency permits the request because this backend currently has no separate authentication layer.

For local development, set the same non-production value in the frontend `.env` as `VITE_API_KEY` and in the backend `.env` as `API_KEY` when testing the key requirement:

```text
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=local-development-key

# backend/.env
API_KEY=local-development-key
```

Do not use the frontend key as authorization for sensitive banking operations. A browser can reveal it, reuse it, or bypass frontend controls. Production will require backend authentication (such as server-managed sessions or tokens) and backend authorization (role and resource policies, tenant isolation, auditability, and server-side enforcement). The frontend must never claim that it authenticates or authorizes users while the backend does not implement those capabilities. Production users should not receive a shared API key in the frontend bundle.

## API integration status
The frontend uses the backend contracts that are actually implemented:
- GET /applications
- GET /applications/{application_id}
- POST /applications
- GET /customers
- GET /customers/{customer_id}
- POST /customers
- PATCH /applications/{application_id}/status

The following areas are intentionally left as placeholders because the backend does not currently provide these endpoints:
- Document upload and status management
- Validation workflow
- AI assistant integration
- Review queues and decisions
- Activity and audit history
- Production authentication and role-based authorization

## Current implemented screens
- Responsive operations shell with routed navigation
- Dashboard summary cards
- Recent applications table
- Direct application detail retrieval
- Create loan application form
- Documents placeholder panel
- Validation placeholder panel
- AI assistant placeholder panel

## Future extension path
The application is structured so future modules can be added without a rewrite:
- API client centralization
- typed responses and request schemas
- reusable enterprise dashboard layout
- future route/view expansion for application detail and workflow pages
