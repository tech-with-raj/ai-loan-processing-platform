# BestBank Roadmap

## Phase 1: Core platform foundation

Status: Implemented

- FastAPI backend
- PostgreSQL and SQLAlchemy
- Alembic migrations
- Customer management
- Loan application management
- Application workflow states
- React operations dashboard
- Docker Compose for API and database
- Optional API-key protection
- Backend tests

Exit criteria:

- Core API endpoints are stable.
- Database schema changes are migration-based.
- Backend validation and error behavior are tested.
- Basic frontend operations work against the API.

## Phase 2: Document workflow

Status: Not implemented

- Object-storage integration
- Secure upload endpoint
- Document metadata endpoint
- Document listing by application
- Document status transitions
- Upload validation and malware considerations
- Frontend document upload and status views

Exit criteria:

- Files are stored separately from application state.
- Metadata and storage keys are consistent.
- Document workflow transitions are constrained and audited.
- Users can upload and inspect documents.

## Phase 3: Deterministic validation

Status: Planned

- Required-document rules
- OCR-independent metadata checks
- Identity and application cross-field validation
- Income calculation rules
- Validation issue and evidence records
- Missing/inconsistent document reports

Exit criteria:

- Validation rules are versioned and reproducible.
- Every issue points to document/application evidence.
- Rule failures return explainable reasons.

## Phase 4: AI extraction and policy retrieval

Status: Planned

- Document-specific extraction schemas
- Source-grounded OCR extraction
- Confidence and uncertainty capture
- Policy document ingestion
- Embedding and vector retrieval
- Retrieval citations
- Retrieval and extraction evaluation

Exit criteria:

- Extraction outputs are typed and validated.
- Unsupported or uncertain data is preserved rather than guessed.
- Policy recommendations include source documents.

## Phase 5: Agent-assisted review

Status: Planned

- Tool-based workflow orchestration
- Document retrieval tools
- Validation tools
- Policy retrieval tools
- Structured review summaries
- Guardrails for external actions
- Human approval checkpoints

Exit criteria:

- Every tool call is logged and authorized.
- The agent cannot bypass business transition rules.
- Human reviewers can approve, reject, or request correction.

## Phase 6: Production hardening

Status: Planned

- Real authentication and authorization
- Deployment environment configuration
- Managed secret storage
- CI/CD pipelines
- Metrics, tracing, and dashboards
- Backups and disaster recovery
- Security review and threat modeling
- Rate limiting and abuse controls
- Cost and latency controls for AI services

Exit criteria:

- Deployment is repeatable.
- Secrets are not stored in source files or images.
- Operations can monitor failures and workflow latency.
- Security and privacy controls are verified.
