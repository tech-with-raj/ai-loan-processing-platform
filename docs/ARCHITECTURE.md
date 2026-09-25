# BestBank — Architecture

## 1. Architecture Purpose

This document defines the current and target architecture of the BestBank AI-powered loan processing platform.

The architecture is intentionally designed to evolve incrementally.

The system should first establish a reliable software and backend foundation before introducing AI, RAG, agents, and autonomous workflows.

---

# 2. Architecture Evolution

BestBank follows this architectural progression:

```text
Foundation
    ↓
Backend API
    ↓
Database
    ↓
Business Services
    ↓
AI Processing
    ↓
RAG
    ↓
Tools
    ↓
Agent Orchestration
    ↓
Controlled Autonomy
    ↓
Evaluation + Observability
    ↓
Production AI System
```

Each layer should be introduced when there is a clear requirement for it.

---

# 3. Current Architecture

The current implementation is centered around:

```text
FastAPI → Service Layer → SQLAlchemy → PostgreSQL
```

The current backend contains:

```text
FastAPI
Pydantic
SQLAlchemy
PostgreSQL
```

---

# 4. Current Component Structure

```text
                    Client
                      |
                      v
                FastAPI API
                      |
                      v
                    Service Layer
                      |
                      v
                  SQLAlchemy
          |
          v
      PostgreSQL
```

Responsibilities are currently separated as follows.

### FastAPI

Responsible for:

- HTTP API
- Routing
- Request handling
- Dependency injection
- API responses

### Service Layer

Responsible for:

- Customer creation
- Loan application creation
- Business logic separate from API logic

### Pydantic

Responsible for:

- Request validation
- Response schemas
- API data contracts

### SQLAlchemy

Responsible for:

- ORM mapping
- Database interaction
- Database sessions

### PostgreSQL

Responsible for:

- Persistent data storage
- Relational integrity
- Customer data
- Loan application data

---

# 5. Current Application Components

Current backend components include:

```text
app/
├── config.py
├── database.py
├── main.py
├── models.py
├── schemas.py
└── services/
  ├── customer_service.py
  └── loan_application_service.py
```

### `config.py`

Responsible for application configuration currently required for database connectivity.

### `database.py`

Responsible for:

```text
DATABASE_URL
     ↓
SQLAlchemy Engine
     ↓
SessionLocal
     ↓
Database Session
```

### `models.py`

Contains SQLAlchemy models for:

```text
Customer
LoanApplication
```

### `schemas.py`

Contains Pydantic schemas for API contracts.

### `main.py`

Contains the FastAPI application and current API endpoints.

### `services/`

Contains service functions used by the API endpoints for customer and loan application creation.

---

# 6. Current Data Architecture

The current database contains two primary entities:

```text
Customer
    |
    | 1
    |
    | N
    v
LoanApplication
```

Relationship:

```text
customers.customer_id
        |
        v
loan_applications.customer_id
```

The relationship is enforced using a PostgreSQL foreign key.

---

# 7. Current API Layer

Current API endpoints:

```text
GET  /
GET  /customers
POST /applications
GET  /applications
```

The current flow for creating a loan application is:

```text
Client
  |
  | POST /applications
  v
FastAPI
  |
  v
Pydantic Validation
  |
  v
LoanApplication Model
  |
  v
SQLAlchemy
  |
  v
PostgreSQL
```

---

# 8. Target Backend Architecture

As the system grows, business logic should not remain entirely inside API route handlers.

The backend should evolve toward:

```text
Client
   |
   v
FastAPI
   |
   v
API Layer
   |
   v
Service Layer
   |
   +------------------+
   |                  |
   v                  v
Repository/Data     Business
Access Layer        Logic
   |                  |
   +--------+---------+
            |
            v
       PostgreSQL
```

The purpose is to separate:

```text
HTTP concerns
Business logic
Data access
```

This will make the system easier to test, maintain, and extend.

---

# 9. Target AI Processing Layer

AI should be introduced as a separate system capability rather than embedding LLM calls directly into API routes.

Target structure:

```text
FastAPI
   |
   v
Business Service
   |
   v
AI Processing Layer
   |
   +------------+-------------+
   |            |             |
   v            v             v
  LLM          RAG          Tools
```

The AI layer should have clear contracts with the rest of the application.

---

# 10. Document Processing Architecture

The target document workflow is:

```text
Loan Application
       |
       v
Document Collection
       |
       v
Document Processing
       |
       v
Information Extraction
       |
       v
Structured Data
       |
       v
Validation
```

The system should distinguish between:

```text
Raw Document
      ↓
Extracted Information
      ↓
Validated Information
```

This separation makes the workflow easier to test and evaluate.

---

# 11. Validation Architecture

Application data and extracted document data should be compared by a validation component.

```text
Application Data
       |
       |
       v
+-------------------+
| Validation Engine |
+-------------------+
       ^
       |
       |
Extracted Document Data
```

The validation system should identify:

```text
MATCH
MISMATCH
MISSING
INVALID
REQUIRES_REVIEW
```

Deterministic validation rules should be preferred where deterministic logic is sufficient.

---

# 12. RAG Architecture

Banking policy retrieval will eventually use Retrieval-Augmented Generation.

Target architecture:

```text
User / System Question
          |
          v
       Retriever
          |
          v
     Vector Search
          |
          v
 Relevant Policy Chunks
          |
          v
       LLM Context
          |
          v
   Grounded Response
```

The RAG system should maintain separation between:

```text
Retrieval
Generation
Validation
```

The LLM should not be treated as the source of truth for banking policies.

Retrieved authoritative policy information should provide the grounding context.

---

# 13. Tool Architecture

Agentic workflows will use controlled tools.

Examples:

```text
Document Tool
Validation Tool
Policy Retrieval Tool
Customer Data Tool
Loan Application Tool
Report Generation Tool
```

Target structure:

```text
Agent
  |
  +--> Tool 1
  |
  +--> Tool 2
  |
  +--> Tool 3
  |
  +--> Tool 4
```

Each tool should have:

- Defined input
- Defined output
- Permission boundaries
- Validation
- Error handling
- Logging
- Appropriate authorization

Tools should not provide unrestricted access to backend capabilities.

---

# 14. Agent Architecture

The target agent architecture is:

```text
Loan Application
       |
       v
Agent Orchestrator
       |
       +-----------------------+
       |           |           |
       v           v           v
Documents      Validation     RAG
Tool           Tool           Tool
       |           |           |
       +-----------+-----------+
                   |
                   v
            Agent State
                   |
                   v
             Final Report
                   |
                   v
            Human Approval
```

The agent should operate within defined boundaries.

The agent should not independently perform unrestricted banking operations.

---

# 15. Agent State

Multi-step workflows require explicit state.

Example:

```text
Application State
       |
       +-- customer information
       |
       +-- documents received
       |
       +-- extraction results
       |
       +-- validation results
       |
       +-- retrieved policies
       |
       +-- identified issues
       |
       +-- approval status
```

Agent state should be persisted or recoverable where required by the workflow.

---

# 16. Controlled Autonomy Architecture

The system should progressively increase autonomy.

```text
Level 0
Human performs process

      ↓

Level 1
AI assists human

      ↓

Level 2
AI produces recommendations

      ↓

Level 3
AI executes approved tools

      ↓

Level 4
AI executes multi-step workflows

      ↓

Level 5
Controlled autonomous workflow
with human escalation
```

The project should progress through these levels rather than immediately attempting unrestricted autonomy.

---

# 17. Human-in-the-Loop Architecture

Important operations should support human intervention.

Target:

```text
                 AI Workflow
                     |
                     v
               Risk / Policy
                 Evaluation
                     |
            +--------+--------+
            |                 |
            v                 v
       Low Risk          Requires Review
            |                 |
            v                 v
      Continue Flow      Human Review
                              |
                              v
                         Decision / Action
```

The system should provide an explicit escalation path.

---

# 18. Guardrail Architecture

AI actions should be constrained by multiple layers.

```text
User Input
    ↓
Input Validation
    ↓
AI Reasoning
    ↓
Tool Permission Check
    ↓
Tool Execution
    ↓
Output Validation
    ↓
Audit Logging
```

Important operations should not rely solely on an LLM instruction such as:

```text
"Do not perform dangerous actions."
```

The system should enforce important restrictions at the software level.

---

# 19. AI Evaluation Architecture

AI components should have measurable evaluation criteria.

```text
AI Input
   |
   v
AI System
   |
   v
Output
   |
   v
Evaluation
   |
   +--> Accuracy
   +--> Groundedness
   +--> Tool Selection
   +--> Workflow Success
   +--> Failure Rate
   +--> Latency
   +--> Cost
```

Evaluation should be treated as an engineering capability.

---

# 20. Observability Architecture

The future production system should provide visibility into:

```text
API Requests
    |
    v
Application Logs
    |
    +--> AI Calls
    |
    +--> Tool Calls
    |
    +--> Retrieval
    |
    +--> Agent Steps
    |
    +--> Errors
    |
    +--> Latency
    |
    +--> Cost
```

The objective is to understand what the AI system did and why.

---

# 21. Security Architecture

Security should exist across the system.

```text
Client
  ↓
Authentication
  ↓
Authorization
  ↓
API Validation
  ↓
Business Logic
  ↓
Tool Authorization
  ↓
Database Access
```

AI-specific security should additionally address:

```text
Prompt Injection
Data Leakage
Unauthorized Tool Use
Excessive Agent Permissions
Sensitive Information Exposure
Unsafe Outputs
```

---

# 22. Production Target Architecture

The eventual target architecture is:

```text
                         Client
                           |
                           v
                    API Gateway / API
                           |
                           v
                    FastAPI Backend
                           |
              +------------+------------+
              |                         |
              v                         v
        Business Services        Authentication
              |
              v
        Data / Repository
              |
              v
          PostgreSQL
              |
              v
       AI Processing Layer
              |
       +------+------+------+
       |      |      |      |
       v      v      v      v
      LLM    RAG   Tools  Evaluation
       |      |      |
      +------+------+
              |
              v
       Agent Orchestrator
              |
              v
        Agent State
              |
              v
      Guardrails / Policy
              |
        +-----+-----+
        |           |
        v           v
   Automated    Human Review
     Action
        |           |
        +-----+-----+
              |
              v
          Audit Logs
              |
              v
       Observability
              |
              v
      Monitoring / Alerts
```

This is a target architecture and will be implemented incrementally.

---

# 23. Architectural Principles

The architecture follows these principles:

### Principle 1 — Separation of Responsibilities

Each component should have a clear responsibility.

### Principle 2 — Deterministic Where Possible

Use traditional software when deterministic logic is sufficient.

### Principle 3 — AI Where Valuable

Use AI for tasks where reasoning, document understanding, retrieval, or language capabilities provide meaningful value.

### Principle 4 — Least Privilege

Agents and tools should receive only the permissions they require.

### Principle 5 — Human Oversight

Important decisions should support human review.

### Principle 6 — Observable AI

AI operations should be measurable and traceable.

### Principle 7 — Evaluated AI

AI functionality should be evaluated using explicit metrics.

### Principle 8 — Incremental Complexity

Do not introduce agents, orchestration frameworks, or infrastructure before the underlying problem requires them.

### Principle 9 — Production Mindset

Correctness, security, reliability, maintainability, latency, cost, and scalability are architectural concerns.

---

# 24. Architecture Evolution Rule

The architecture should evolve only when there is a demonstrated requirement.

Example:

```text
Simple API
    ↓
Service Layer
    ↓
AI Service
    ↓
RAG Service
    ↓
Tool Layer
    ↓
Agent Orchestrator
    ↓
State Management
    ↓
Evaluation
    ↓
Observability
```

A new framework or infrastructure component should only be introduced when it solves a concrete engineering problem.

---

# 25. Current vs Target

| Capability | Current | Target |
|---|---|---|
| FastAPI | Implemented | Production-ready |
| PostgreSQL | Implemented | Production-ready |
| SQLAlchemy | Implemented | Production-ready |
| Business service layer | Early / next stage | Implemented |
| Document processing | Not implemented | Implemented |
| LLM | Not implemented | Implemented |
| RAG | Not implemented | Implemented |
| Tools | Not implemented | Implemented |
| Agent orchestration | Not implemented | Implemented |
| Agent state | Not implemented | Implemented |
| Human approval | Not implemented | Implemented |
| Guardrails | Not implemented | Implemented |
| AI evaluation | Not implemented | Implemented |
| Observability | Not implemented | Implemented |
| Docker | Planned | Implemented |
| CI/CD | Planned | Implemented |
| Cloud deployment | Planned | Implemented |

---

# 26. Architectural Goal

The final architecture should demonstrate that BestBank is not simply an application that calls an LLM.

It should demonstrate:

```text
Software Engineering
        +
Backend Engineering
        +
AI Engineering
        +
RAG
        +
Tool Engineering
        +
Agent Engineering
        +
Security
        +
Evaluation
        +
Observability
        +
Cloud / DevOps
        =
AI Systems Engineering
```

The architecture should ultimately support reliable collaboration between:

```text
Human
  +
AI
  +
Software Systems
  +
External Tools
```

with appropriate control, evaluation, observability, and escalation mechanisms.