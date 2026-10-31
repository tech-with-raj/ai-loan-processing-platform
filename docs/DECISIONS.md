# Architecture Decisions

## Decision record format

Each decision captures the current choice and its rationale. Entries marked as planned are not implemented.

## ADR-001: FastAPI for the backend

Status: Accepted and implemented

FastAPI provides typed Python endpoints, automatic OpenAPI generation, dependency injection, and straightforward async-compatible request handling. It is suitable for a backend that will later host document and AI orchestration workflows.

## ADR-002: PostgreSQL as the system database

Status: Accepted and implemented

PostgreSQL provides UUID support, enums, numeric precision, constraints, transactions, and strong ecosystem support. SQLAlchemy maps domain models without hiding the database.

## ADR-003: SQLAlchemy 2 with Alembic

Status: Accepted and implemented

SQLAlchemy models define typed application entities. Alembic owns repeatable schema evolution and is required for Docker-based database setup.

## ADR-004: Pydantic request and response validation

Status: Accepted and implemented

Pydantic v2 validates external API payloads, serializes response models, and keeps request contracts close to FastAPI routes.

Loan amounts use decimal validation and are serialized as strings in API responses. The frontend preserves that precision instead of converting amounts to JavaScript floats.

## ADR-005: Service classes for business operations

Status: Accepted and implemented

Customer and loan application operations use service classes so route functions remain thin. Services own database commits, rollback paths, and domain exceptions.

## ADR-006: Explicit application transition graph

Status: Accepted and implemented

Allowed application transitions are declared in `app/enums.py` rather than controlled by an implicit status assignment. Invalid transitions return HTTP 400.

## ADR-007: Optional API-key protection

Status: Accepted and implemented

If `API_KEY` is configured, mutating and data-reading API routes require `X-API-Key`. The root route remains public. This is suitable for an initial deployment boundary, not for user-level authorization.

## ADR-008: React, TypeScript, and Vite for the dashboard

Status: Accepted and implemented

The frontend uses typed fetch calls and reusable React components. Vite provides a fast development server and production build pipeline.

## ADR-009: Centralized HTTP client configuration

Status: Accepted and implemented

`frontend/src/services/api.ts` owns the API base URL and API-key header. Components use typed methods instead of embedding fetch details.

## ADR-010: Document status is modeled before document APIs

Status: Accepted and implemented

The document model and migration establish persistence and state vocabulary while implementation of object storage and upload is pending. No endpoint should imply unsupported document behavior.

## ADR-011: AI and document processing remain separate integration phases

Status: Planned

Extraction, validation, RAG, and agent workflows will be added behind backend interfaces. LLM calls will not directly mutate application state without validation and audit controls.

## ADR-012: Human approval will remain available

Status: Planned

AI-generated recommendations may support decisions but must not replace controlled human approval for consequential loan outcomes.
