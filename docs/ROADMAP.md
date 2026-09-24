# BestBank — AI Systems Engineering Roadmap

This document defines the implementation and learning roadmap for BestBank.

The roadmap is designed to progressively transform BestBank from a backend application into a production-oriented **Agentic AI / Autonomous AI System**.

The project follows:

```text
LEARN
  ↓
BUILD
  ↓
APPLY
  ↓
INTERVIEW
  ↓
FIND GAPS
  ↓
IMPROVE
```

The goal is not to master every technology before building.

The goal is to build real systems, learn the required concepts when they become necessary, and continuously improve the system.

---

# 1. Long-Term Career Direction

BestBank supports the following career progression:

```text
Software Engineer
        ↓
AI Engineer
        ↓
Agentic AI Engineer
        ↓
Senior AI / Agentic Engineer
        ↓
AI Systems Engineer
        ↓
AI Tech Lead / AI Architect
```

The project is primarily designed to develop the capabilities required for:

**AI Systems Engineer specializing in Agentic AI / Autonomous AI Systems.**

---

# 2. Current Project Position

Current stage:

```text
Backend Foundation + Database Integration
```

Current architecture:

```text
Client
   ↓
FastAPI
   ↓
API Endpoints
   ↓
SQLAlchemy
   ↓
PostgreSQL
```

Implemented foundation:

- FastAPI application
- REST endpoints
- PostgreSQL database
- SQLAlchemy models
- Customer entity
- Loan Application entity
- UUID identifiers
- Pydantic schemas
- Environment-based database configuration
- Basic API/database integration
- Initial test structure
- Git/GitHub project management
- Persistent project documentation

AI and agentic capabilities are not yet implemented.

---

# 3. Roadmap Overview

BestBank will evolve through the following phases:

```text
Phase 1
Backend Foundation
        ↓
Phase 2
Production Backend
        ↓
Phase 3
Document Processing
        ↓
Phase 4
AI Information Extraction
        ↓
Phase 5
Validation & Decision Support
        ↓
Phase 6
RAG
        ↓
Phase 7
AI Tools
        ↓
Phase 8
Agentic Workflows
        ↓
Phase 9
Human-in-the-Loop
        ↓
Phase 10
Controlled Autonomy
        ↓
Phase 11
AI Evaluation
        ↓
Phase 12
Security & Observability
        ↓
Phase 13
Docker & Cloud
        ↓
Phase 14
Production AI System
```

---

# Phase 1 — Backend Foundation

## Objective

Build a reliable backend foundation before introducing AI.

## Skills

- Python
- FastAPI
- REST
- HTTP
- Pydantic
- PostgreSQL
- SQL
- SQLAlchemy
- Database relationships
- Transactions
- Environment configuration
- Git/GitHub

## Current capabilities

Customer and loan application APIs exist.

The database can persist loan application information.

## Remaining work

- Improve project structure
- Introduce service layer
- Improve validation
- Improve error handling
- Improve database handling
- Add stronger tests
- Establish consistent API behavior

## Completion criteria

The backend should have a clean separation between:

```text
API
 ↓
Business Logic
 ↓
Database Access
 ↓
PostgreSQL
```

---

# Phase 2 — Production Backend

## Objective

Transform the basic backend into a more production-oriented service.

## Build

- Service layer
- Repository/data-access patterns where justified
- Request validation
- Response validation
- Exception handling
- HTTP error responses
- Logging
- Database transaction handling
- Pagination
- Filtering
- API versioning where appropriate
- Automated tests

## Engineering skills

Learn:

- Separation of concerns
- Dependency injection
- Unit testing
- Integration testing
- API testing
- Database testing
- Error handling
- Logging
- Configuration management

## Completion criteria

The backend should behave like a real maintainable application rather than a collection of demo endpoints.

---

# Phase 3 — Loan Document Processing

## Objective

Introduce the actual banking workflow.

Loan applications should support documents such as:

- Identity documents
- Income documents
- Bank statements
- Address proof
- Employment documents
- Other supporting documents

## Build

```text
Loan Application
       ↓
Document Upload
       ↓
Document Metadata
       ↓
Document Storage
       ↓
Processing Status
```

## Learn

- File uploads
- File validation
- MIME types
- Object storage concepts
- Document metadata
- Secure file handling
- Background processing concepts

## Completion criteria

A loan application can have multiple documents with tracked processing states.

---

# Phase 4 — AI Information Extraction

## Objective

Use AI to extract structured information from unstructured documents.

Example:

A bank statement may contain:

```text
Account Holder: Raj
Monthly Income: ₹85,000
Average Balance: ₹42,000
Employer: ABC Ltd
```

The AI system should convert this into structured data.

Example:

```json
{
  "account_holder": "Raj",
  "monthly_income": 85000,
  "average_balance": 42000,
  "employer": "ABC Ltd"
}
```

## Learn

- LLM fundamentals
- Tokens
- Context windows
- Prompt design
- Structured outputs
- JSON schemas
- Model selection
- Temperature
- LLM API integration
- AI error handling

## Important principle

AI output must not automatically be trusted.

The system should validate the extracted information.

## Completion criteria

Documents can be processed into structured information with validation and traceability.

---

# Phase 5 — Validation & Decision Support

## Objective

Compare extracted information against application data and business rules.

Example:

```text
Application income:
₹80,000

Document income:
₹80,000

Result:
MATCH
```

Another example:

```text
Application income:
₹80,000

Document income:
₹55,000

Result:
MISMATCH
```

## Build

- Field validation
- Cross-document validation
- Business rules
- Missing document detection
- Inconsistent information detection
- Validation reports
- Confidence handling

## Principle

Use deterministic rules whenever possible.

For example:

```python
if extracted_income != application_income:
    create_validation_issue()
```

An LLM should not be used where a simple deterministic rule is sufficient.

## Completion criteria

BestBank can identify missing, inconsistent, or invalid information.

---

# Phase 6 — Retrieval-Augmented Generation (RAG)

## Objective

Give the AI system access to relevant banking policies and documentation.

Example:

```text
User question
      ↓
Retrieve relevant policy
      ↓
Provide retrieved context to LLM
      ↓
Generate grounded response
```

Potential knowledge sources:

- Loan policies
- Eligibility criteria
- Documentation requirements
- Internal procedures
- Product policies
- Compliance guidance

## Learn

- Embeddings
- Vector search
- Chunking
- Metadata
- Retrieval
- Similarity search
- Top-k retrieval
- RAG pipelines
- Retrieval evaluation
- Grounded generation

## Completion criteria

The system can retrieve relevant policy information and use it to support AI responses.

---

# Phase 7 — AI Tools

## Objective

Allow AI workflows to interact with the BestBank system through controlled tools.

Potential tools:

```text
get_customer()
get_application()
get_documents()
check_missing_documents()
validate_application()
retrieve_policy()
create_validation_issue()
update_application_status()
request_human_review()
```

## Tool architecture

```text
AI
 ↓
Tool Selection
 ↓
Permission Check
 ↓
Input Validation
 ↓
Tool Execution
 ↓
Result Validation
 ↓
Audit Log
```

## Learn

- Function calling
- Tool schemas
- Tool permissions
- Tool validation
- Tool errors
- Tool result handling
- Auditability

## Completion criteria

AI can safely perform selected system operations through controlled tools.

---

# Phase 8 — Agentic Workflows

## Objective

Move from isolated AI calls to multi-step AI workflows.

Example:

```text
New Loan Application
        ↓
Check Required Documents
        ↓
Retrieve Available Documents
        ↓
Process Documents
        ↓
Extract Information
        ↓
Validate Information
        ↓
Retrieve Relevant Policy
        ↓
Generate Validation Report
        ↓
Determine Next Action
```

This is where the system begins demonstrating genuine agentic behavior.

## Learn

- Agent state
- Workflow state
- Planning
- Routing
- Conditional execution
- Tool calling
- Retry strategies
- Fallbacks
- Workflow termination
- Failure recovery

## Important distinction

An agent is not simply:

```text
LLM + prompt
```

A useful agentic system includes:

```text
Reasoning
+
State
+
Tools
+
Workflow
+
Constraints
+
Feedback
+
Error handling
```

## Completion criteria

BestBank can execute a controlled multi-step loan-processing workflow.

---

# Phase 9 — Human-in-the-Loop

## Objective

Introduce human approval and escalation into AI workflows.

Example:

```text
AI Workflow
     ↓
Validation
     ↓
Confidence / Risk / Policy Check
     ↓
 ┌───────────────┐
 │               │
Safe            Uncertain
 │               │
 ↓               ↓
Continue       Human Review
                 ↓
          Approve / Reject / Correct
```

## Build

- Review queue
- Human approval state
- Human rejection state
- Correction workflow
- Escalation
- Audit trail

## Learn

- Human-AI collaboration
- Escalation design
- Approval workflows
- Exception handling
- Auditability

## Completion criteria

The system knows when to stop autonomous execution and request human intervention.

---

# Phase 10 — Controlled Autonomy

## Objective

Allow the AI system to execute low-risk tasks autonomously while enforcing strict boundaries.

Target model:

```text
Level 0
Human performs everything

Level 1
AI assists

Level 2
AI recommends

Level 3
AI executes low-risk operations

Level 4
AI executes complete workflows within defined boundaries

Level 5
AI operates autonomously within strict policies
and escalates exceptions
```

## Learn

- Autonomous workflows
- Permission boundaries
- Guardrails
- Policy enforcement
- Risk-based autonomy
- Failure recovery
- Human escalation
- State management

## Example

The system may automatically:

```text
Check documents
        ↓
Extract information
        ↓
Validate fields
        ↓
Retrieve policy
        ↓
Generate report
```

But may require human approval for:

```text
High-risk decision
Policy exception
Low-confidence extraction
Conflicting evidence
Missing critical information
```

## Completion criteria

BestBank demonstrates controlled autonomous behavior rather than unrestricted AI execution.

---

# Phase 11 — AI Evaluation

## Objective

Measure whether the AI system actually works.

## Evaluate

### Extraction

- Field accuracy
- Structured output validity

### Retrieval

- Recall
- Precision
- Relevance
- Context quality

### Generation

- Groundedness
- Hallucination rate
- Answer quality

### Agents

- Tool selection accuracy
- Workflow completion rate
- Failure rate
- Retry behavior
- Escalation accuracy

### System

- Latency
- Cost
- Reliability
- Human intervention rate

## Learn

- Evaluation datasets
- Golden datasets
- Test cases
- LLM-as-judge concepts
- Deterministic evaluation
- Regression testing
- AI quality metrics

## Completion criteria

AI features have measurable quality criteria rather than being judged only by manual observation.

---

# Phase 12 — Security & Observability

## Objective

Make the AI system safer and easier to operate.

## Security

Implement concepts such as:

- Authentication
- Authorization
- Role-based access
- Input validation
- Secret management
- API security
- Prompt injection defense
- Tool permissions
- Data access controls
- Audit logging

## Observability

Track:

```text
Requests
Errors
Latency
Database operations
LLM calls
Token usage
Model usage
Tool calls
Workflow states
Failures
Human interventions
```

## Learn

- Structured logging
- Metrics
- Distributed tracing
- AI observability
- Security monitoring
- Audit systems
- Incident investigation

## Completion criteria

Developers can understand what happened inside the system when something goes wrong.

---

# Phase 13 — Docker & Cloud

## Objective

Make BestBank deployable as a real application.

## Build

```text
FastAPI
PostgreSQL
AI Services
Document Storage
Frontend
```

using containerized infrastructure where appropriate.

## Learn

- Docker
- Docker Compose
- Container networking
- Environment configuration
- CI/CD
- Cloud deployment
- Infrastructure concepts
- Health checks
- Production configuration

## Cloud direction

AWS is the current preferred cloud direction.

Cloud services should be introduced only when they solve a real deployment or infrastructure requirement.

## Completion criteria

BestBank can be deployed outside the local development environment.

---

# Phase 14 — Production AI System

## Objective

Bring all system capabilities together.

Target architecture:

```text
                    ┌──────────────┐
                    │   Frontend   │
                    └──────┬───────┘
                           │
                           ↓
                    ┌──────────────┐
                    │   FastAPI    │
                    │     API      │
                    └──────┬───────┘
                           │
                           ↓
                 ┌───────────────────┐
                 │ Application       │
                 │ Services          │
                 └─────────┬─────────┘
                           │
             ┌─────────────┼─────────────┐
             ↓             ↓             ↓
        PostgreSQL     Documents       AI
                                         │
                                         ↓
                                      RAG
                                         │
                                         ↓
                                      Tools
                                         │
                                         ↓
                                      Agent
                                         │
                                  ┌──────┴──────┐
                                  ↓             ↓
                              Autonomous      Human
                              Execution       Review
                                  │             │
                                  └──────┬──────┘
                                         ↓
                              Evaluation + Audit
                                         ↓
                              Observability + Security
```

The final system should demonstrate:

- Backend engineering
- Database engineering
- AI engineering
- RAG
- Tool calling
- Agentic workflows
- Controlled autonomy
- Human-in-the-loop
- AI evaluation
- Security
- Observability
- Docker
- Cloud
- CI/CD

---

# 4. Learning Strategy

The project should follow:

```text
Learn enough
     ↓
Implement
     ↓
Test
     ↓
Understand failure
     ↓
Improve
```

We do not wait until every concept is mastered before implementation.

For each major feature:

```text
1. Understand the problem
2. Understand the architecture
3. Learn the required concept
4. Implement
5. Test
6. Debug
7. Document
8. Commit
9. Push
10. Move forward
```

---

# 5. Career Skill Mapping

BestBank should continuously develop the following capability groups.

## Software Engineering

- Python
- OOP
- Type hints
- Error handling
- Testing
- Git/GitHub
- Linux
- REST
- HTTP
- APIs
- Design principles

## Backend Engineering

- FastAPI
- Pydantic
- SQL
- PostgreSQL
- SQLAlchemy
- Authentication
- Authorization
- Transactions
- API design
- Service architecture

## AI Engineering

- LLMs
- Prompting
- Structured outputs
- Embeddings
- RAG
- Model selection
- Evaluation
- LLM APIs
- AI reliability

## Agent Engineering

- Tool calling
- State
- Routing
- Planning
- Workflow orchestration
- Memory
- Retries
- Fallbacks
- Human-in-the-loop

## Autonomous Systems Engineering

- Guardrails
- Permissions
- Policy enforcement
- Risk boundaries
- Autonomous execution
- Escalation
- Evaluation
- Observability
- Failure recovery

## Production Engineering

- Docker
- CI/CD
- Cloud
- Logging
- Metrics
- Tracing
- Security
- Secrets
- Monitoring

---

# 6. Project Progression Rule

We should not move to the next major phase simply because the previous phase exists.

A phase should satisfy its meaningful completion criteria.

For example:

```text
Database exists
```

does not automatically mean:

```text
Database engineering is complete.
```

Likewise:

```text
LLM API works
```

does not automatically mean:

```text
AI engineering is complete.
```

And:

```text
Agent can call tools
```

does not automatically mean:

```text
Autonomous AI system is production-ready.
```

Each phase must progressively improve reliability and engineering quality.

---

# 7. Definition of Done

For major features, use:

```text
Feature implemented
        ↓
Tests added
        ↓
Errors handled
        ↓
Security considered
        ↓
Observability considered
        ↓
AI evaluation considered where applicable
        ↓
Documentation updated
        ↓
Git commit
        ↓
Git push
```

---

# 8. Current Priority

The immediate priority is **not agents**.

The immediate priority is:

```text
Strengthen Backend Foundation
        ↓
Production Backend Patterns
        ↓
Document Workflow
        ↓
AI Extraction
```

This ensures that when AI and agents are introduced, they are built on a reliable software foundation.

---

# 9. Long-Term Success Criteria

BestBank will be considered successful when it demonstrates the following progression:

```text
Traditional Backend
        ↓
AI-Enabled Backend
        ↓
AI Workflow System
        ↓
Agentic System
        ↓
Human + AI Collaborative System
        ↓
Controlled Autonomous System
        ↓
Production-Oriented Autonomous AI System
```

The final objective is not merely to demonstrate an LLM.

The objective is to demonstrate the ability to design, build, evaluate, secure, observe, and operate an AI system that can reason, use tools, execute workflows, handle failures, operate within defined boundaries, and escalate to humans when necessary.

---

# 10. Roadmap Maintenance

This document should evolve with the project.

When a major milestone is completed:

1. Update this roadmap.
2. Update `CURRENT_STATE.md`.
3. Update `LEARNING_LOG.md`.
4. Update `TODO.md`.
5. Record significant architectural changes in `DECISIONS.md`.
6. Commit the documentation.
7. Push to GitHub.

The GitHub repository remains the persistent source of truth for the project's current state and direction.