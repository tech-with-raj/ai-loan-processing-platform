# BestBank — Engineering TODO

This document contains the actionable work remaining for BestBank.

`ROADMAP.md` describes the long-term direction.

`CURRENT_STATE.md` describes the current implementation.

`TODO.md` contains the concrete work items we should execute.

Tasks should be updated as the project progresses.

---

# 1. Current Priority

The Dockerized regression run and initial PostgreSQL integration coverage are
complete. Remaining backend priorities are broader PostgreSQL transaction and
relational-constraint testing, followed by reliability and production hardening.

The broader project direction is:

```text id="y4p4b1"
Strengthen Backend Foundation
        ↓
Production Backend Patterns
        ↓
Document Workflow
        ↓
AI Integration
```

We should not jump directly to agentic AI before the backend foundation is reliable.

Next backend work:

1. Extend PostgreSQL coverage for transaction behavior and relational constraints
2. Backend reliability and production hardening

---

# 2. Backend Foundation

## API Structure

- [x] Review current FastAPI application structure
- [x] Separate API routes from business logic for create operations
- [x] Introduce service layer
- [ ] Organize routes by domain
- [ ] Improve dependency management
- [ ] Review API naming conventions

## Validation

- [x] Review current request validation
- [x] Add field constraints for current request schemas
- [x] Validate loan amount
- [x] Validate loan type
- [x] Validate customer information
- [x] Validate referenced customer IDs

## Error Handling

- [x] Add consistent HTTP error responses
- [x] Handle missing customers
- [x] Handle invalid application requests
- [x] Handle duplicate customer email
- [x] Map duplicate customer errors to HTTP 409
- [x] Add centralized application exception handling
- [x] Handle commit-time SQLAlchemy errors in CustomerService and
  LoanApplicationService with rollback and DatabaseOperationError
- [x] Review transaction/session behavior
- [ ] Review database error handling beyond the current commit-failure paths

## Database

- [ ] Review database schema
- [ ] Review indexes
- [ ] Review constraints
- [x] Review transaction handling
- [x] Review session lifecycle
- [x] Add initial Alembic schema migrations

---

# 3. Testing

## Unit Testing

- [x] Add service-layer tests
- [x] Test validation rules
- [x] Test business logic
- [x] Test error conditions
- [x] Test mocked service commit failures, rollback calls, and
  `DatabaseOperationError`

## API Testing

- [x] Test `GET /`
- [x] Test `GET /customers`
- [x] Test `GET /customers/{customer_id}` success, missing-resource 404, and
  invalid-UUID 422 behavior
- [x] Test `GET /applications`
- [x] Test `GET /applications/{application_id}` success, missing-resource 404,
  and invalid-UUID 422 behavior
- [x] Test `POST /customers`
- [x] Test `POST /applications`
- [x] Test `PATCH /applications/{application_id}/status` for allowed and
  disallowed transitions, invalid statuses, missing applications, and
  persisted updates
- [x] Test invalid requests
- [x] Test missing resources

## Integration Testing

- [x] Test FastAPI + PostgreSQL integration through the Docker Compose database
- [x] Run the Dockerized regression suite and record the result:
  - `docker compose run --build --rm api python -m alembic upgrade head`
    completed successfully.
  - After rebuilding the API image to include the new test,
    `docker compose run --rm api pytest -v` collected and passed all 42 tests.
    Pytest reported one Starlette/httpx deprecation warning and no failures.
  - The host-side run was not used because Windows PostgreSQL was listening on
    port 5432; the successful run used temporary Compose API containers and the
    PostgreSQL service.
- [ ] Test broader transaction behavior against PostgreSQL; the direct
  foreign-key rejection test verifies rollback of its failed insert and that
  the application was not persisted, while the duplicate-email test verifies
  recovery from that specific failure path. Neither establishes behavior for
  every possible database failure. Service commit-failure/rollback checks use
  mocks.
- [x] Test customer-email uniqueness and rollback recovery against PostgreSQL:
  after PostgreSQL rejects a duplicate email, `CustomerService` rolls back the
  failed transaction and the same SQLAlchemy session successfully creates a
  customer with a different email. This proves recovery from the duplicate-
  email failure path only, not every possible database failure.
- [x] Test PostgreSQL foreign-key rejection for an application with a
  nonexistent customer ID; expect `IntegrityError`, roll back, and verify the
  application was not persisted
- [ ] Test other relational constraints directly against PostgreSQL
- [x] Test customer creation followed by loan application creation against
  PostgreSQL

## Test Quality

- [x] Establish meaningful test coverage for current backend behavior
- [x] Add regression tests for duplicate customer email handling
- [ ] Separate unit and integration tests where useful

---

# 4. Customer Management

- [x] Create customer API
- [x] Retrieve customer
- [ ] Update customer
- [x] Validate customer data
- [x] Handle duplicate customer email
- [x] Add customer tests

Target API structure:

```text id="l2kz0r"
POST   /customers
GET    /customers
GET    /customers/{customer_id}
PUT    /customers/{customer_id}
```

The exact API design may evolve as implementation progresses.

---

# 5. Loan Application Management

- [x] Create loan applications through the service layer
- [x] Retrieve individual applications
- [x] Update application status
- [x] Validate application state transitions
- [ ] Add application filtering
- [ ] Add pagination where required
- [x] Add application tests

Potential lifecycle:

```text id="v3y0j4"
CREATED
   ↓
DOCUMENTS_PENDING
   ↓
PROCESSING
   ↓
VALIDATION
   ↓
REVIEW
   ↓
APPROVED / REJECTED
```

The exact states will be finalized when the workflow is implemented.

---

# 6. Document Management

## Document Entity

- [ ] Design document database model
- [ ] Define document types
- [ ] Associate documents with loan applications
- [ ] Track document status
- [ ] Track upload timestamp
- [ ] Track processing timestamp
- [ ] Track processing errors

## Document Upload

- [ ] Implement document upload endpoint
- [ ] Validate file type
- [ ] Validate file size
- [ ] Generate secure document identifier
- [ ] Store document metadata
- [ ] Design document storage abstraction

## Processing

- [ ] Define document processing states
- [ ] Implement processing workflow
- [ ] Handle processing failures
- [ ] Implement retry strategy where appropriate

---

# 7. AI Information Extraction

This phase begins after the document workflow is stable.

## LLM Integration

- [ ] Select appropriate LLM provider/model
- [ ] Implement secure API configuration
- [ ] Create LLM service abstraction
- [ ] Handle timeouts
- [ ] Handle API failures
- [ ] Handle rate limits
- [ ] Track model usage

## Structured Extraction

- [ ] Define extraction schemas
- [ ] Extract customer information
- [ ] Extract income information
- [ ] Extract employment information
- [ ] Extract financial information
- [ ] Validate structured output
- [ ] Store extraction results

## Reliability

- [ ] Define extraction confidence
- [ ] Handle incomplete extraction
- [ ] Handle malformed output
- [ ] Implement retry/fallback behavior where appropriate
- [ ] Preserve original document information

---

# 8. Validation Engine

- [ ] Define validation rules
- [ ] Compare application data with extracted data
- [ ] Detect mismatches
- [ ] Detect missing information
- [ ] Detect conflicting information
- [ ] Generate validation issues
- [ ] Generate validation report
- [ ] Store validation results

Example:

```text id="7v8i2u"
Application Income
        ↓
₹80,000

Document Income
        ↓
₹75,000

Validation
        ↓
MISMATCH
```

---

# 9. Banking Policy Knowledge Base

- [ ] Identify initial policy documents
- [ ] Define policy document format
- [ ] Prepare documents for retrieval
- [ ] Implement document chunking
- [ ] Generate embeddings
- [ ] Store embeddings
- [ ] Implement semantic retrieval
- [ ] Return relevant policy context
- [ ] Track retrieved sources

---

# 10. RAG

- [ ] Implement ingestion pipeline
- [ ] Implement embedding pipeline
- [ ] Implement retrieval
- [ ] Implement context construction
- [ ] Connect retrieved context to LLM
- [ ] Implement source attribution
- [ ] Handle retrieval failures
- [ ] Evaluate retrieval quality
- [ ] Evaluate groundedness

Target:

```text id="x7b1ct"
Question
   ↓
Retrieve Policy
   ↓
Relevant Context
   ↓
LLM
   ↓
Grounded Response
```

---

# 11. AI Tools

Initial tools may include:

- [ ] `get_customer`
- [ ] `get_application`
- [ ] `get_documents`
- [ ] `check_missing_documents`
- [ ] `validate_application`
- [ ] `retrieve_policy`
- [ ] `create_validation_issue`
- [x] `update_application_status`
- [ ] `request_human_review`

For every tool:

- [ ] Define purpose
- [ ] Define input schema
- [ ] Define output schema
- [ ] Validate input
- [ ] Enforce permissions
- [ ] Handle errors
- [ ] Log execution
- [ ] Record audit information

---

# 12. Agentic Workflow

- [ ] Define agent goals
- [ ] Define workflow state
- [ ] Define available tools
- [ ] Define allowed transitions
- [ ] Implement tool selection
- [ ] Implement conditional routing
- [ ] Implement retries
- [ ] Implement fallbacks
- [ ] Implement workflow termination
- [ ] Handle workflow failures
- [ ] Persist important workflow state

Target workflow:

```text id="g1j3dw"
Loan Application
      ↓
Document Check
      ↓
Document Processing
      ↓
AI Extraction
      ↓
Validation
      ↓
Policy Retrieval
      ↓
Validation Report
      ↓
Next Action
```

---

# 13. Human-in-the-Loop

- [ ] Define situations requiring human review
- [ ] Create review state
- [ ] Create review queue
- [ ] Create approval action
- [ ] Create rejection action
- [ ] Create correction action
- [ ] Record human decisions
- [ ] Resume workflow after human action
- [ ] Audit human intervention

---

# 14. Controlled Autonomy

- [ ] Define autonomy boundaries
- [ ] Define low-risk operations
- [ ] Define high-risk operations
- [ ] Define approval requirements
- [ ] Define tool permissions
- [ ] Implement policy enforcement
- [ ] Implement escalation
- [ ] Implement failure recovery

Target:

```text id="f67l6v"
AI
 ↓
Can I perform this action?
 ↓
Policy Check
 ↓
Permission Check
 ↓
Execute / Escalate
```

---

# 15. AI Evaluation

## Extraction Evaluation

- [ ] Create evaluation dataset
- [ ] Define expected extraction results
- [ ] Measure field-level accuracy
- [ ] Measure structured-output validity

## RAG Evaluation

- [ ] Create retrieval test set
- [ ] Measure retrieval relevance
- [ ] Measure retrieval quality
- [ ] Measure groundedness

## Agent Evaluation

- [ ] Test tool selection
- [ ] Test workflow completion
- [ ] Test failure handling
- [ ] Test escalation behavior
- [ ] Test incorrect tool usage

## System Evaluation

- [ ] Measure latency
- [ ] Measure token usage
- [ ] Measure cost
- [ ] Measure failure rate
- [ ] Measure human intervention rate

---

# 16. Security

## Application Security

- [ ] Authentication
- [ ] Authorization
- [ ] Role-based access
- [ ] Input validation
- [ ] Secure secrets management
- [ ] API security
- [ ] Rate limiting

## Database Security

- [ ] Least-privilege database access
- [ ] Secure credentials
- [ ] SQL injection protection
- [ ] Sensitive-data handling

## AI Security

- [ ] Prompt injection protection
- [ ] Tool permission boundaries
- [ ] Output validation
- [ ] Data leakage protection
- [ ] AI access control
- [ ] Audit logging

---

# 17. Observability

## Logging

- [ ] Structured application logs
- [ ] Error logs
- [ ] API request logs
- [ ] AI workflow logs
- [ ] Tool execution logs

## Metrics

- [ ] API latency
- [ ] Error rate
- [ ] Database performance
- [ ] LLM latency
- [ ] Token usage
- [ ] AI workflow success rate
- [ ] Tool failure rate

## Tracing

- [ ] Trace API requests
- [ ] Trace AI workflows
- [ ] Trace tool execution
- [ ] Trace external service calls

---

# 18. Docker and Local Containerization

- [x] Create Dockerfile for the FastAPI application
- [x] Containerize the FastAPI application
- [x] Create Docker Compose configuration for the API and PostgreSQL
- [x] Connect the API to PostgreSQL through the Compose service hostname
- [x] Add a PostgreSQL health check and wait for it before starting the API
- [x] Persist PostgreSQL data in a named Compose volume
- [x] Build and manually verify the local container deployment, API endpoints,
  and customer persistence
- [x] Add `.dockerignore`
- [x] Run regression tests after Dockerization (42 passed; result recorded in
  the Integration Testing checklist)
- [ ] Review `.dockerignore` coverage and investigate the approximately
  187.66 MB build context for appropriate optimization
- [ ] Review runtime configuration and secrets management before any
  non-local deployment

---

# 19. CI/CD

- [ ] Configure GitHub Actions
- [ ] Run automated tests
- [ ] Run linting
- [ ] Validate code quality
- [ ] Build Docker image
- [ ] Add deployment pipeline when cloud deployment begins

Target:

```text id="q4nkjr"
Git Push
   ↓
CI
   ↓
Tests
   ↓
Quality Checks
   ↓
Build
   ↓
Deploy
```

---

# 20. Cloud Deployment

Preferred direction:

**AWS**

Potential future infrastructure:

- Compute
- Managed PostgreSQL
- Object storage
- Secrets management
- Monitoring
- Networking
- Container deployment

Cloud services should be introduced only when the project requires them.

---

# 21. Documentation

Maintain:

- [x] `PROJECT_CONTEXT.md`
- [x] `CURRENT_STATE.md`
- [x] `ARCHITECTURE.md`
- [x] `DECISIONS.md`
- [x] `ROADMAP.md`
- [x] `LEARNING_LOG.md`
- [x] `TODO.md`

After completing a major feature:

```text id="hbyknm"
Implementation
      ↓
Testing
      ↓
Documentation
      ↓
Git Commit
      ↓
Git Push
```

---

# 22. Immediate Next Tasks

The next engineering cycle should focus only on the backend foundation.

Priority order:

- [x] Review current backend
- [ ] Improve project structure
- [x] Introduce service layer for create operations
- [ ] Improve validation
- [ ] Complete remaining error-handling review
- [ ] Add meaningful tests
- [ ] Verify database behavior, including Dockerized regression and PostgreSQL
  integration tests
- [ ] Update documentation
- [ ] Commit
- [ ] Push

Transaction/session review, commit-time database error handling, individual
retrieval endpoints, the application status transition workflow, and local
Docker Compose setup are complete. The Dockerized 42-test regression run and
initial PostgreSQL integration coverage are complete. Direct PostgreSQL
duplicate-email rollback recovery is verified for that failure path only; the
foreign-key rejection test verifies rollback and non-persistence of the failed
insert. Neither covers every possible database failure. Broader PostgreSQL
transaction behavior and other relational-constraint testing remain open.

Do not start RAG or agent frameworks yet.

---

# 23. Future Backlog

These items are intentionally not immediate priorities.

- [ ] Frontend improvements
- [ ] Authentication
- [ ] Authorization
- [ ] Advanced database migrations
- [ ] Document storage
- [ ] Background jobs
- [ ] AI extraction
- [ ] RAG
- [ ] Vector search
- [ ] AI tools
- [ ] Agent workflows
- [ ] Human review system
- [ ] AI evaluation
- [ ] Security hardening
- [ ] Observability
- [ ] Production container deployment
- [ ] CI/CD
- [ ] AWS deployment

---

# 24. Task Priority Rules

Tasks should generally be prioritized in this order:

```text id="zy0zdb"
Correctness
    ↓
Reliability
    ↓
Security
    ↓
Testability
    ↓
Maintainability
    ↓
Performance
    ↓
Scalability
    ↓
Advanced AI capabilities
```

This prevents the project from becoming an impressive demo that is difficult to operate or maintain.

---

# 25. Engineering Rule

Before adding a new technology, ask:

```text id="e9e7i2"
What problem does it solve?

Can the current stack solve the problem?

What complexity does it introduce?

What are the alternatives?

Is the complexity justified?

Will it improve the production quality of the system?
```

If the answer is unclear, do not add the technology yet.

---

# 26. Definition of Done

A task is considered complete when appropriate:

```text id="v7u3ub"
Implementation complete
        ↓
Tests complete
        ↓
Error handling complete
        ↓
Security considered
        ↓
Observability considered
        ↓
Documentation updated
        ↓
Git commit
        ↓
Git push
```

Not every small task requires every item, but every production-relevant feature should be evaluated against these criteria.

---

# 27. Current Focus

The most important current goal is:

**Build a strong software/backend foundation before introducing autonomous AI behavior.**

The progression remains:

```text id="8z2tby"
Backend
   ↓
AI
   ↓
RAG
   ↓
Tools
   ↓
Agents
   ↓
Human + AI
   ↓
Controlled Autonomy
   ↓
Production Autonomous AI System
```

The project should move forward one reliable layer at a time.