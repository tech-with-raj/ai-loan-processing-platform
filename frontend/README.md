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

## API integration status
The frontend currently uses the backend contracts that are actually implemented:
- GET /applications
- POST /applications
- GET /customers

The following areas are intentionally left as placeholders because the backend does not currently provide these endpoints:
- Application detail page by ID
- Document upload and status management
- Validation workflow
- AI assistant integration

## Current implemented screens
- Login-style landing workspace shell
- Dashboard summary cards
- Recent applications table
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
