# BestBank — Current State

## Last Updated

2026-10-07

---

## 1. Current Phase

**Phase:** Backend Foundation / Database Integration

The project is currently in the foundational software engineering stage.

The current implementation focuses on:

```text
FastAPI → Service Layer → SQLAlchemy → PostgreSQL
```

AI and agentic capabilities have not yet been integrated into the application.

---

## 2. Overall Project Progress

```text
Foundation
    ↓
Backend
    ↓
Database
    ↓
AI
    ↓
RAG
    ↓
Tools
    ↓
Agents
    ↓
Controlled Autonomy
    ↓
Evaluation
    ↓
Observability
    ↓
Production
```

Current position:

```text
Foundation
    ↓
Backend
    ↓
Database
    ↑
CURRENT STAGE
```

The next major objective is to continue strengthening the backend foundation before introducing AI capabilities.

---

## 3. Repository Structure

Current repository structure includes:

```text
ai-loan-processing-platform/
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── enums.py
│   ├── exceptions.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── services/
│       ├── __init__.py
│       ├── customer_service.py
│       └── loan_application_service.py
│
├── alembic/
│   ├── env.py
│   └── versions/
│       ├── 20260924_initial_schema.py
│       └── 20260924_customer_timestamp_timezone.py
│
├── database/
│   └── schema.sql
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CURRENT_STATE.md
│   ├── DECISIONS.md
│   ├── LEARNING_LOG.md
│   ├── PROJECT_CONTEXT.md
│   ├── ROADMAP.md
│   └── TODO.md
│
├── frontend/
│
├── tests/
│   ├── __init__.py
│   ├── test_customer_service.py
│   ├── test_loan_application_service.py
│   └── test_main.py
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## 4. Backend Status

### FastAPI

FastAPI application has been created.

Current application title:

```text
BestBank API
```

The application currently exposes:

```text
GET /
POST /customers
GET /customers
GET /customers/{customer_id}
POST /applications
GET /applications
GET /applications/{application_id}
PATCH /applications/{application_id}/status
```

Customer and loan application creation now use the service layer.

Loan application statuses can be updated through
`PATCH /applications/{application_id}/status`. Valid transitions use the
shared `APPLICATION_STATUS_TRANSITIONS` definition and `can_transition()`;
invalid transitions return HTTP 400, missing applications return HTTP 404,
and unrecognized statuses return HTTP 422.

`CustomerService` and `LoanApplicationService` handle SQLAlchemy errors raised
by their commit operations. Customer integrity errors are translated to
`DuplicateCustomerError`; other commit-time SQLAlchemy errors are translated
to `DatabaseOperationError`. Both services roll back the session when a
caught commit error occurs. Failure-path unit tests verify that rollback is
called and `DatabaseOperationError` is raised.

The transaction/session review and commit-time database error handling are
complete. PostgreSQL integration testing remains incomplete.

---

## 5. Current API Functionality

### Health / Root Endpoint

```text
GET /
```

Purpose:

Verify that the BestBank API is running.

Expected response:

```json
{
  "message": "BestBank API is running"
}
```

---

### Customer Endpoint

```text
POST /customers
GET /customers
GET /customers/{customer_id}
```

`POST /customers` creates a customer through `CustomerService`.
Customer request data is validated by Pydantic. Duplicate email handling
uses the database unique constraint as the authority:

```text
PostgreSQL UNIQUE constraint
        ↓
SQLAlchemy IntegrityError
        ↓
CustomerService rolls back and raises DuplicateCustomerError
        ↓
Centralized exception handler returns HTTP 409 Conflict
```

`DuplicateCustomerError` is an application-level exception defined in
`app/exceptions.py`. The service layer does not depend on HTTP exceptions.

`GET /customers` retrieves customers from the database directly through
SQLAlchemy.

`GET /customers/{customer_id}` retrieves one customer through
`CustomerService`. A missing customer returns HTTP 404, and an invalid UUID
returns HTTP 422.

The customer listing endpoint uses:

```text
FastAPI
   ↓
SQLAlchemy Session
   ↓
Customer Model
   ↓
PostgreSQL
```

---

### Loan Application Creation

```text
POST /applications
```

Purpose:

Create a new loan application.

Loan application creation is handled through the service layer.
When the referenced customer does not exist, `LoanApplicationService` raises
`CustomerNotFoundError` instead of a generic `ValueError`.

Current request data includes:

```text
customer_id
loan_type
loan_amount
```

The application is initially created with:

```text
status = CREATED
```

A UUID is generated for the application.

### Application Exception Handling

Application exceptions share a common base class:

```text
ApplicationError
├── DuplicateCustomerError
├── CustomerNotFoundError
├── ApplicationNotFoundError
└── DatabaseOperationError
```

The service layer raises these application-specific exceptions and remains
independent of HTTP concepts such as `HTTPException`. FastAPI handles them
centrally:

```text
Application Exception
        ↓
Centralized FastAPI Exception Handler
        ↓
HTTP Response
```

`CustomerNotFoundError` maps to HTTP 404 Not Found, and
`DuplicateCustomerError` maps to HTTP 409 Conflict. Route-level exception
handling is not required in `main.py`. `ApplicationNotFoundError` maps to
HTTP 404 Not Found for an application that does not exist.

---

### Loan Application Retrieval

```text
GET /applications
GET /applications/{application_id}
```

`GET /applications` retrieves loan applications from the database.

`GET /applications/{application_id}` retrieves one loan application through
`LoanApplicationService`. A missing application raises
`ApplicationNotFoundError` and returns HTTP 404. Invalid UUIDs for either
individual retrieval endpoint return HTTP 422.

---

## 6. Database Status

PostgreSQL is currently being used as the relational database.

The current database schema contains:

```text
customers
loan_applications
```

### Customers

Current fields:

```text
customer_id
name
email
phone
created_at
```

### Loan Applications

Current fields:

```text
application_id
customer_id
loan_type
loan_amount
status
created_at
```

There is a foreign-key relationship:

```text
customers
    |
    | customer_id
    |
    v
loan_applications
```

This establishes the relationship between a customer and their loan applications.

---

## 7. ORM Status

SQLAlchemy models have been created for:

```text
Customer
LoanApplication
```

The application uses SQLAlchemy sessions through a FastAPI dependency:

```text
get_db()
```

The database session is opened for the request and closed after the request completes.

---

## 8. Pydantic Schema Status

Pydantic schemas currently exist for:

```text
CustomerResponse
LoanApplicationCreate
LoanApplicationResponse
```

The schemas provide API request and response validation.

The response schemas use:

```text
from_attributes = True
```

to support conversion from SQLAlchemy model objects.

---

## 9. Database Connection Status

The database connection is configured using:

```text
DATABASE_URL
```

The value is loaded from environment configuration.

Current flow:

```text
Environment Variable
        ↓
app/config.py
        ↓
DATABASE_URL
        ↓
SQLAlchemy Engine
        ↓
SessionLocal
        ↓
FastAPI Dependency
```

The application raises an error if `DATABASE_URL` is not configured.

---

## 10. CORS Status

CORS middleware is currently configured for local frontend development.

Allowed origins currently include:

```text
http://localhost:5173
http://127.0.0.1:5173
```

This supports communication between the backend and a local frontend development server.

---

## 11. Current AI Status

AI functionality has **not yet been implemented in the application**.

The following are planned but not currently part of the working backend:

```text
LLM integration
Document processing
Information extraction
RAG
Embeddings
Vector search
Tool calling
Agent workflows
Agent state management
AI evaluation
AI guardrails
Autonomous execution
Human approval workflow
```

These should be introduced progressively.

---

## 12. Current Agentic AI Status

No autonomous agent is currently implemented.

The target future architecture is:

```text
Loan Application
       ↓
Agent
       ↓
Tools
       ├── Document Checker
       ├── Information Extractor
       ├── Validation Tool
       ├── Policy Retrieval
       └── Report Generator
       ↓
Human Approval
```

This is a future target, not the current implementation.

---

## 13. Current Testing Status

The repository contains 30 passing tests across service and API tests:

```text
tests/
├── __init__.py
├── test_customer_service.py
├── test_loan_application_service.py
└── test_main.py
```

Current tests cover:

- Customer creation and duplicate email errors at service level
- Customer service commit failure handling, rollback, and
  `DatabaseOperationError`
- Loan application creation and missing-customer validation
- Loan application service commit failure handling, rollback, and
  `DatabaseOperationError`
- Successful individual customer and loan application retrieval
- Missing individual customers and loan applications returning HTTP 404
- Invalid UUIDs for both individual retrieval endpoints returning HTTP 422
- Duplicate customer email returning HTTP 409
- Invalid customer email and invalid loan request validation
- Existing API behavior, including listing and pagination

Transaction/session review and commit-time database error handling are
complete. PostgreSQL integration tests and future AI workflow coverage remain
to be added as those capabilities are developed.

Backend CI is passing after PR #2 was merged into `main`.


---

## 14. Current Production Readiness

The project is **not production-ready yet**.

Important production capabilities still need to be implemented progressively.

These include:

```text
Authentication
Authorization
Additional input validation
Broader database error handling beyond the current service commit-failure paths
Structured logging
Security controls
Secrets management
Production migration workflow
Broader automated test coverage
CI/CD
Docker
Observability
Monitoring
AI evaluation
Guardrails
Rate limiting
Audit logging
Cloud deployment
```

These are planned engineering capabilities, not current features.

---

## 15. Current Learning Progress

The current implementation has provided practical experience with:

```text
FastAPI
REST API fundamentals
HTTP endpoints
Pydantic
PostgreSQL
SQL
SQLAlchemy
ORM concepts
Database relationships
UUID
Foreign keys
Database sessions
Environment configuration
Git
GitHub
```

The current reliability milestone additionally covers database transactions,
COMMIT versus ROLLBACK, SQLAlchemy session lifecycle, service-level transaction
handling, failure-path testing, and application-level database exceptions.

The project is intentionally being used to learn these concepts through implementation rather than theory alone.

---

## 16. Important Current Understanding

The project is intentionally being built from the bottom up.

The current approach is:

```text
First understand the backend
        ↓
Build the backend
        ↓
Connect the database
        ↓
Understand data flow
        ↓
Add business logic
        ↓
Test the system
        ↓
Introduce AI
        ↓
Introduce RAG
        ↓
Introduce tools
        ↓
Introduce agents
        ↓
Introduce controlled autonomy
```

AI should not be added merely to make the project look like an AI project.

The goal is to understand how AI becomes part of a real software system.

---

## 17. Current Next Direction

The application status transition workflow is implemented. The immediate
backend priority is PostgreSQL integration testing.

The next work should progressively address:

```text
Application status transition workflow (complete)
        ↓
PostgreSQL integration testing
        ↓
Docker and production backend work
        ↓
Authentication / authorization
        ↓
Document workflow
        ↓
AI integration
```

The exact next task should be maintained in:

```text
docs/TODO.md
```

---

## 18. Source of Truth Rule

This file represents the current known implementation state.

Whenever a significant feature is:

- Added
- Removed
- Changed
- Completed
- Replaced

this file should be updated.

---

## 19. Current Status Summary

```text
Project                 : BestBank
Repository              : ai-loan-processing-platform

Backend                 : In progress
FastAPI                 : Implemented
PostgreSQL              : Implemented
SQLAlchemy              : Implemented
Customer model          : Implemented
Loan application model  : Implemented
Customer API            : Implemented
Loan application API    : Implemented
Individual customer retrieval : Implemented; 404 and invalid-UUID 422 tested
Individual application retrieval : Implemented; 404 and invalid-UUID 422 tested
ApplicationNotFoundError : Implemented and centrally handled
Application status transition workflow : Implemented and tested
Transaction/session review : Completed
Database commit error handling : Implemented in customer and loan application services
Rollback on handled commit errors : Implemented and failure-path tested
Automated tests         : 41 passing
AI integration          : Not started
RAG                     : Not started
Tool calling            : Not started
Agent workflow          : Not started
Autonomous workflow     : Not started
Evaluation              : Not started
Observability           : Not started
Production deployment   : Not started

Current focus:
PostgreSQL integration testing.
```