# BestBank Learning Log

## Backend and API design

- FastAPI dependency injection keeps database sessions scoped to each request.
- Application-specific exceptions are easier to map to consistent HTTP responses than exposing SQLAlchemy or database exceptions directly.
- Pydantic response models are useful for controlling serialized API contracts, while service methods remain responsible for persistence behavior.
- UUID validation is provided naturally by FastAPI/Pydantic path and body handling.

## Data modeling

- `NUMERIC(15, 2)` provides a stable representation for monetary values.
- Decimal request fields should remain strings at the API boundary to avoid floating-point precision errors.
- Timezone-aware database timestamps avoid ambiguity for applications used across locations.
- Database constraints should complement service-layer validation. For example, unique email constraints catch races while the service returns a user-facing duplicate error.
- Enum-backed workflow status is clearer than storing unbounded status strings.

## State transitions

- Defining allowed transitions as graph data prevents unintended status jumps.
- Approved and rejected statuses should remain terminal.
- Invalid transitions deserve a domain exception and HTTP 400 rather than silently updating state.
- Workflow transition rules belong in shared backend logic, not only in the frontend.

## SQLAlchemy and migrations

- Alembic migrations are the source of truth for deployed database structure.
- Creating a Docker database does not automatically create application tables.
- Migration order matters: the document migration depends on the customer/application migration chain.
- A migration should be designed for existing data, not only a new empty database.

## FastAPI and testing

- Dependency overrides make it possible to test routes against an existing SQLAlchemy session fixture.
- Separate service tests and route tests cover both business behavior and HTTP contracts.
- Explicit assertions for status codes, JSON bodies, decimal strings, and UUID strings catch contract regressions.
- Transaction rollback behavior should be verified for duplicate and database failures.

## Frontend integration

- Centralizing API base URL and API-key behavior reduces duplicated request configuration.
- TypeScript API types should mirror the backend, not represent aspirational fields.
- UI placeholders should remain clearly separated from implemented API capabilities.
- Loading and settled error states should be handled independently when the frontend issues multiple data requests.
- React state can represent dashboard views, but stable URL routing is still needed as workflow depth grows.

## Docker and environment setup

- The API container requires `DATABASE_URL` before SQLAlchemy creates its engine.
- PostgreSQL health checks protect API startup from immediate connection attempts, but migrations still need to be applied explicitly.
- A named volume preserves database state across normal `docker compose down` operations.
- API-key configuration should be environment-specific and should never be committed in source control.

## Future AI implementation guidance

- Document extraction should produce typed, validated data with source evidence.
- Validation rules should run before any model-generated recommendation.
- RAG responses should include source references and retrieval boundaries.
- AI agents need explicit tool permissions, state transitions, logging, and human checkpoints.
- Evaluation datasets and replayable cases should be established before production automation.
