# BestBank TODO

## High priority

- Add an Alembic migration startup strategy or document startup sequencing clearly in deployment tooling.
- Add document upload and retrieval endpoints.
- Integrate document metadata with object storage.
- Add frontend status-update controls and status transition feedback.
- Add tests for API-key enforcement and protected-route behavior.
- Add list pagination links or cursor behavior if the frontend needs offsets beyond current limits.
- Add production environment examples for required backend configuration.

## Backend

- Add customer update and delete rules if required by the product.
- Add application filtering and sorting.
- Add document list and detail endpoints.
- Add document status transition validation.
- Add application/document audit history.
- Add authentication and role-based authorization.
- Add request logging correlation IDs.
- Add structured health and readiness endpoints.
- Add database connection and migration startup checks.
- Add a background task abstraction for document processing.
- Add object-storage configuration and provider abstraction.
- Add deterministic document validation services.

## Frontend

- Replace presentation login state with real authentication UI.
- Add application detail navigation and status history.
- Connect document upload to backend endpoints.
- Display document statuses and validation results.
- Add customer creation to the dashboard.
- Add API error parsing for structured JSON responses.
- Add automated frontend tests.
- Add routes for stable browser navigation.
- Add environment-specific API configuration examples.

## AI and validation

- Define required loan document types.
- Implement document identification and OCR.
- Define extraction schemas for each document type.
- Add confidence scoring and source references.
- Implement cross-field validation.
- Add missing-document detection.
- Add policy retrieval with grounded citations.
- Add a recommendation workflow that does not auto-approve or reject applications.
- Add replayable evaluation datasets.
- Add prompt, model, tool, latency, cost, and outcome telemetry.

## Operations

- Add frontend service to Docker Compose.
- Add migration execution to a controlled startup/initialization step.
- Add CI jobs for backend tests, frontend build, and frontend lint.
- Add container health checks and API readiness checks.
- Add deployment configuration for staging and production.
- Add secret management.
- Add backup and restore procedures for PostgreSQL.

## Documentation

- Add endpoint examples for every implemented route.
- Add a database migration runbook.
- Add a troubleshooting guide for Docker and local development.
- Document production API-key rotation.
- Add model/API compatibility notes for frontend and backend releases.
