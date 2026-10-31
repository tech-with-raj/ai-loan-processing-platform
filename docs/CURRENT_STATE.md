# BestBank Current State

Last reviewed: 2026-10-30

## Delivered

### Backend

- FastAPI service with customer and loan application CRUD reads
- Customer creation
- Application creation with customer existence validation
- Application status updates with explicit transition rules
- Pydantic v2 validation
- SQLAlchemy 2 models and PostgreSQL integration
- Duplicate email handling
- Optional API-key protection
- JSON application error responses
- Pagination for customer and application lists
- Alembic migration chain
- Pytest API and service coverage

### Database

- PostgreSQL-compatible customer, application, and document models
- UUID primary keys
- Timezone-aware timestamps
- Application and document enum types
- Unique customer email constraint
- Document storage-key uniqueness
- Explicit foreign-key relationships

### Frontend

- React/Vite/TypeScript dashboard
- Customer and application loading
- Application creation form
- Application search and recent application table
- Dashboard counters derived from application status
- Loading and error states
- Placeholder views for documents, validation, and assistant workflows

### Operations

- Docker image for the API
- Docker Compose for PostgreSQL and API
- Named PostgreSQL volume
- Swagger/ReDoc FastAPI documentation

## Partially implemented

### Document workflow

The `Document` model, document status enum, and Alembic migration exist. Upload, storage, listing, processing, and status APIs are not implemented.

### Status workflow

Application status transitions are enforced in the service layer and available through an API endpoint. The frontend does not currently call the status endpoint.

### API security

API-key enforcement is implemented when `API_KEY` is configured. There is no user authentication, role model, authorization policy, rate limiting, or secret manager integration.

### Database migration lifecycle

Migrations are available and documented, but Docker Compose startup does not run them automatically.

### Frontend identity

The login-style screen is a local UI state only. It does not authenticate against the backend.

## Not implemented

- AI/LLM integration
- Document OCR and parsing
- Structured extraction
- Deterministic validation engine
- Banking policy RAG
- AI agents and tool calling
- Human approval workflow
- Audit history for state changes
- Document endpoints and object storage
- Automated document-status transitions
- Background jobs or queues
- Real user authentication
- Evaluation and observability
- CI/CD workflows in the repository
- Cloud deployment

## Known constraints

- No seed or demo customer endpoint exists beyond API creation and database migrations.
- The frontend starts with no customers or applications until backend data is available.
- The frontend and API must be configured for the same origin policy and API key.
- Docker Compose provisions the API and database only; migrations remain a manual step.
- The test fixture depends on a configured PostgreSQL database.
- The document migration chain assumes the customer and application migration chain has been applied first.

## Validation

The repository contains pytest coverage for:

- API routes and validation responses
- Customer creation and lookup
- Application creation and lookup
- Pagination
- Status transitions
- Duplicate customers
- Database error behavior
- Document model behavior

Run backend tests with:

```powershell
pytest
```

Run frontend checks with:

```powershell
cd frontend
npm install
npm run build
npm run lint
```
