# BestBank Architecture

## Current architecture

```text
React/Vite frontend
        |
        | HTTP/JSON (X-API-Key when configured)
        v
FastAPI application
        |
        +-- API routes (app/main.py)
        +-- service layer (app/services/)
        +-- Pydantic request/response schemas
        +-- application exceptions and handlers
        |
        v
SQLAlchemy 2
        |
        v
PostgreSQL 16
```

Docker Compose provides the PostgreSQL and FastAPI containers. The frontend runs separately with Vite in development.

## Backend components

### Configuration

`app/config.py` loads environment variables through `python-dotenv`.

- `DATABASE_URL` is required.
- `API_KEY` is optional. When it is set, protected routes require the `X-API-Key` header. The root route is public.

### Database

`app/database.py` creates the SQLAlchemy engine and session factory. Requests receive a session through `get_db()` and the session closes after the request.

### Models

`app/models.py` defines:

- `Customer`
- `LoanApplication`
- `Document`

`Customer` and `LoanApplication` relationships are represented with foreign keys. Documents have a model and database migration, but there is currently no document upload API.

### Schemas

`app/schemas.py` contains the Pydantic v2 request and response contracts. It validates customer fields, supported loan types, loan amount limits, and application status updates.

The loan application response normalizes legacy stored loan-type values before serialization.

### Routes

`app/main.py` exposes:

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Service health message |
| POST | `/customers` | Create a customer |
| GET | `/customers` | List customers with pagination |
| GET | `/customers/{customer_id}` | Retrieve a customer |
| POST | `/applications` | Create an application |
| GET | `/applications` | List applications with pagination |
| GET | `/applications/{application_id}` | Retrieve an application |
| PATCH | `/applications/{application_id}/status` | Advance or reject an application |

List routes use `limit` and `offset` query parameters. Limits are constrained to 1-100 rows.

### Services

Customer operations and application operations live in service classes:

- `app/services/customer_service.py`
- `app/services/loan_application_service.py`

Services perform existence checks, duplicate handling, commits, rollbacks, and application-level error translation.

### Error handling

Application exceptions are registered in `app/exception_handlers.py` and return JSON `detail` responses:

- 400 invalid status transition
- 404 customer or application not found
- 409 duplicate customer email
- 500 database operation failure
- 422 FastAPI/Pydantic validation error

## Status workflows

Application statuses are:

```text
CREATED -> DOCUMENTS_PENDING -> PROCESSING -> VALIDATION -> REVIEW
                                                           |
                                                   APPROVED / REJECTED
```

Only transitions declared in `APPLICATION_STATUS_TRANSITIONS` are permitted. Approved and rejected are terminal.

Document statuses are modeled as:

```text
MISSING -> UPLOADED -> PROCESSING -> PROCESSED -> VALIDATION_REQUIRED
                                                   |
                                             VALID / INVALID
```

The document transition rules are defined in `app/enums.py`, but document workflow endpoints are not implemented yet.

## Database migrations

Alembic manages schema evolution.

The migration chain currently includes:

1. Initial customer and loan application schema.
2. Customer timezone-aware timestamps.
3. Documents table and document status enum.

Database startup through Docker Compose does not run migrations automatically. Apply migrations explicitly:

```powershell
docker compose exec api python -m alembic upgrade head
```

## Frontend architecture

The React frontend uses:

- React 19
- TypeScript 6
- Vite 8
- `src/services/api.ts` for backend calls
- `src/types.ts` for API response and request types

The dashboard is organized as application views rather than URL routes. It includes:

- dashboard summary cards
- customer and application data
- application creation
- search and application display
- placeholder documents, validation, assistant, and login surfaces

The login surface is presentation only; it does not create an authenticated backend session. Status updates are supported by the API but are not currently exposed in the main React workflow.

## Deployment

The API image uses Python 3.13 and starts Uvicorn on port 8000. PostgreSQL is exposed on host port 5432. The frontend is not included in Docker Compose.

## Planned architecture boundaries

These capabilities are goals, not current runtime components:

- Document storage and upload service
- OCR/document parsing
- Structured extraction
- Deterministic and cross-document validation
- Banking policy retrieval and RAG
- Controlled AI agent/tool orchestration
- Human approval and audit trail
- Evaluation, tracing, and metrics
- Authentication and authorization
- Cloud deployment and CI/CD
