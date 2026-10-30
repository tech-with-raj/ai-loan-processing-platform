# BestBank Project Context

## Purpose

BestBank is an engineering project for a loan processing platform. The implemented foundation manages customers, loan applications, application state transitions, and database-backed documents. The longer-term product goal is to automate document collection, extraction, validation, policy checks, and controlled human review.

## Current users

- Banking loan officers: review applications and operational status.
- Operations teams: monitor customers, documents, and validation outcomes.
- Platform developers: maintain API, workflows, integrations, and AI services.

## Current system scope

The running system currently supports:

- Customer creation and retrieval
- Loan application creation and retrieval
- Application list pagination
- Explicit application status transitions
- A React operations dashboard
- PostgreSQL persistence
- Docker Compose for API and database infrastructure

## Domain entities

### Customer

A customer has a UUID, name, unique email, optional phone number, and creation timestamp.

### Loan application

An application has a UUID, customer reference, loan type, decimal loan amount, workflow status, and creation timestamp.

Supported loan types are Personal Loan, Home Loan, Vehicle Loan, and Business Loan.

### Document

A document belongs to an application and records the original filename, content type, storage key, status, and creation timestamp. Storage objects and document endpoints are future work.

## Current workflow

```text
Create customer
      |
      v
Create application
      |
      v
CREATED
      |
      v
Status transitions are validated by the API
      |
      v
APPROVED or REJECTED
```

## Engineering principles

- Keep API contracts explicit with Pydantic and typed frontend models.
- Use database transactions and service-layer rollback handling.
- Represent workflow state transitions declaratively.
- Separate request handling, business operations, and persistence.
- Distinguish implemented behavior from roadmap features.
- Keep AI decisions explainable and subject to human oversight.
- Prefer auditable, policy-grounded automation over autonomous decisions.

## Repository layout

```text
app/                   FastAPI backend
alembic/               Database migrations
database/schema.sql    Standalone PostgreSQL schema reference
docs/                  Architecture and delivery documentation
frontend/              React/Vite dashboard
tests/                 Backend pytest suite
scripts/               Project scripts
Dockerfile             API container image
docker-compose.yml     API and PostgreSQL services
```
