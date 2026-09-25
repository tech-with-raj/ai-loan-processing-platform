# BestBank — Engineering TODO

This document contains the actionable work remaining for BestBank.

`ROADMAP.md` describes the long-term direction.

`CURRENT_STATE.md` describes the current implementation.

`TODO.md` contains the concrete work items we should execute.

Tasks should be updated as the project progresses.

---

# 1. Current Priority

The immediate goal is:

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

---

# 2. Backend Foundation

## API Structure

- [x] Review current FastAPI application structure
- [ ] Separate API routes from business logic
- [x] Introduce service layer
- [ ] Organize routes by domain
- [ ] Improve dependency management
- [ ] Review API naming conventions

## Validation

- [ ] Review request validation
- [ ] Add appropriate field constraints
- [ ] Validate loan amount
- [ ] Validate loan type
- [ ] Validate customer information
- [ ] Validate referenced customer IDs

## Error Handling

- [ ] Add consistent HTTP error responses
- [ ] Handle missing customers
- [ ] Handle invalid application requests
- [ ] Handle database errors
- [ ] Add centralized exception handling where appropriate

## Database

- [ ] Review database schema
- [ ] Review indexes
- [ ] Review constraints
- [ ] Review transaction handling
- [ ] Review session lifecycle
- [ ] Introduce migrations when schema evolution requires them

---

# 3. Testing

## Unit Testing

- [ ] Add service-layer unit tests
- [ ] Test validation rules
- [ ] Test business logic
- [ ] Test error conditions

## API Testing

- [ ] Test `GET /`
- [ ] Test `GET /customers`
- [ ] Test `GET /applications`
- [ ] Test `POST /applications`
- [ ] Test invalid requests
- [ ] Test missing resources
- [ ] Test database failures

## Integration Testing

- [ ] Test FastAPI + PostgreSQL integration
- [ ] Test transaction behavior
- [ ] Test relational constraints
- [ ] Test complete loan application creation flow

## Test Quality

- [ ] Establish meaningful test coverage
- [ ] Add regression tests for important bugs
- [ ] Separate unit and integration tests where useful

---

# 4. Customer Management

- [ ] Create customer API
- [ ] Retrieve customer
- [ ] Update customer
- [ ] Validate customer data
- [ ] Handle duplicate customer information
- [ ] Add customer tests

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

- [ ] Improve loan application creation
- [ ] Retrieve individual applications
- [ ] Update application status
- [ ] Validate application state transitions
- [ ] Add application filtering
- [ ] Add pagination where required
- [ ] Add application tests

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
- [ ] `update_application_status`
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

# 18. Docker

- [ ] Create Dockerfile
- [ ] Containerize FastAPI application
- [ ] Create Docker Compose configuration
- [ ] Containerize PostgreSQL for local development where appropriate
- [ ] Configure environment variables
- [ ] Add health checks
- [ ] Test local container deployment

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
- [ ] Introduce service layer
- [ ] Improve validation
- [ ] Improve error handling
- [ ] Add meaningful tests
- [ ] Verify database behavior
- [ ] Update documentation
- [ ] Commit
- [ ] Push

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
- [ ] Docker
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