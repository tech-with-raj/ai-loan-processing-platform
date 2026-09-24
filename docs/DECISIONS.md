# BestBank — Architecture & Engineering Decisions

This document records the important technical and architectural decisions made during the development of BestBank.

The purpose is to preserve **why** a decision was made, not just what technology was selected.

This document should be updated whenever a major architectural or engineering decision is made.

---

# 1. Decision-Making Principles

BestBank follows these principles when making technical decisions:

1. Prefer simple solutions over unnecessary complexity.
2. Choose technology based on the problem, not popularity.
3. Understand the architecture before implementing it.
4. Prefer production-oriented engineering over demo-oriented implementation.
5. Introduce AI only where it provides meaningful value.
6. Use deterministic software where deterministic logic is sufficient.
7. Keep humans involved where business or regulatory decisions require human judgment.
8. Design for reliability, security, evaluation, observability, and maintainability.
9. Introduce new frameworks only when there is a clear engineering reason.
10. Preserve existing working functionality when adding new capabilities.
11. Build incrementally rather than attempting the complete system at once.

---

# 2. PostgreSQL as the Primary Database

## Decision

Use PostgreSQL as the primary relational database for BestBank.

## Why

BestBank is a banking-oriented application with structured and relational data such as:

- Customers
- Loan applications
- Documents
- Extracted information
- Validation results
- Loan processing states
- Users
- Audit records
- AI workflow state

These entities have relationships and require transactional consistency.

PostgreSQL provides:

- Strong relational data modeling
- Foreign keys
- Transactions
- Constraints
- UUID support
- Numeric/decimal types for financial values
- JSON/JSONB support when semi-structured data is required
- Indexing
- Mature SQL capabilities
- Strong reliability characteristics
- Good support for production backend systems

## Alternatives considered

Other relational databases such as MySQL, Microsoft SQL Server, and Oracle could also support the core application.

NoSQL databases could be useful for specific workloads, but the core BestBank domain is strongly relational.

## Reason for current choice

PostgreSQL provides a strong combination of relational integrity, flexibility, production capability, and suitability for an AI-enabled backend.

## Status

Accepted.

---

# 3. FastAPI for the Backend API

## Decision

Use Python FastAPI as the backend API framework.

## Why

BestBank requires a backend capable of:

- REST APIs
- Request validation
- Database interaction
- Authentication and authorization
- Document processing
- AI/LLM integration
- Tool execution
- Agent workflows
- Asynchronous operations
- API documentation

FastAPI fits naturally with the Python ecosystem that will later be used for:

- LLMs
- RAG
- Embeddings
- AI evaluation
- Agentic workflows
- Data processing

FastAPI also provides strong request/response validation through Pydantic and automatic API documentation.

## Alternatives considered

Possible alternatives include:

- Flask
- Django
- Node.js/Express
- Java/Spring Boot

These are capable technologies, but Python provides stronger alignment with the AI engineering direction of BestBank.

## Status

Accepted.

---

# 4. SQLAlchemy for Database Access

## Decision

Use SQLAlchemy for database interaction.

## Why

Direct SQL is useful and will still be learned and used where appropriate.

However, the application needs a maintainable database access layer.

SQLAlchemy provides:

- Python database models
- Relationship mapping
- Query construction
- Transaction management
- Database abstraction
- Integration with PostgreSQL
- Maintainable application-level database code

The goal is not to hide SQL knowledge.

The goal is to understand both:

SQL → database fundamentals

and

SQLAlchemy → application-level database engineering

## Status

Accepted.

---

# 5. REST API Architecture

## Decision

Use REST APIs as the primary communication mechanism between the frontend and backend.

## Why

The BestBank system consists of multiple logical components.

For example:

Frontend → Backend API → Business Logic → Database

Later:

Frontend → API → AI Workflow → Tools → Database / External Services

REST provides a clear boundary between these components.

It also provides:

- Standard HTTP semantics
- Clear resource-based APIs
- Easy testing
- Easy integration
- Good observability
- Straightforward deployment

## Status

Accepted.

---

# 6. UUIDs for Primary Identifiers

## Decision

Use UUIDs for major entity identifiers.

Examples:

- `customer_id`
- `application_id`

## Why

UUIDs provide globally unique identifiers without requiring the application to expose sequential database IDs.

This is useful for distributed systems and future service boundaries.

For example:

```text
customer_id:
550e8400-e29b-41d4-a716-446655440000
```

instead of:

```text
customer_id:
1
2
3
4
```

UUIDs also reduce the ability to infer the number of records from an identifier.

## Status

Accepted.

---

# 7. Relational Customer → Loan Application Model

## Decision

Represent customers and loan applications as separate relational entities.

Relationship:

```text
Customer
   |
   | 1
   |
   | many
   ↓
Loan Application
```

A customer can have multiple loan applications.

## Why

This represents the actual business relationship and avoids unnecessary duplication.

For example:

```text
Customer
customer_id = C1
name = Raj
```

can have:

```text
Loan Application A1
Loan Application A2
Loan Application A3
```

The customer information does not need to be duplicated in every application record.

## Status

Accepted.

---

# 8. Financial Values Use Numeric/Decimal Types

## Decision

Loan amounts use PostgreSQL `NUMERIC(15,2)`.

## Why

Financial values require predictable decimal precision.

Floating-point types can introduce representation problems for monetary calculations.

For example:

```text
10000.10
```

should be represented accurately.

Therefore BestBank uses:

```sql
NUMERIC(15,2)
```

for loan amounts.

## Status

Accepted.

---

# 9. Configuration Through Environment Variables

## Decision

Database configuration is supplied through environment variables.

Example:

```text
DATABASE_URL
```

## Why

Application configuration should not be hard-coded into source code.

This supports:

- Local development
- Testing
- Docker
- CI/CD
- Cloud deployment
- Secret management

Different environments can therefore use different database configurations without changing application code.

## Important future improvement

Production secrets should eventually be managed through a proper secret-management mechanism rather than plain `.env` files.

## Status

Accepted.

---

# 10. Incremental Architecture

## Decision

Build BestBank incrementally.

The system will evolve through stages:

```text
Foundation
    ↓
Backend API
    ↓
Database
    ↓
Business Services
    ↓
Document Processing
    ↓
AI Extraction
    ↓
Validation
    ↓
RAG
    ↓
Tools
    ↓
Agent Workflows
    ↓
Controlled Autonomy
    ↓
Evaluation
    ↓
Observability
    ↓
Production Deployment
```

## Why

Building the complete AI system immediately would create unnecessary complexity.

The goal is to understand how each layer works before adding the next layer.

This also makes debugging easier.

If the database layer is unstable, adding agents will not solve the underlying problem.

## Status

Accepted.

---

# 11. Deterministic Logic Before AI

## Decision

Use conventional software logic wherever deterministic logic is sufficient.

AI should be introduced where it provides meaningful value.

## Example

Checking whether:

```text
loan_amount <= approved_limit
```

does not necessarily require an LLM.

A deterministic rule is:

```python
if loan_amount > approved_limit:
    reject()
```

However, extracting information from an unstructured bank statement may benefit from AI.

Therefore:

```text
Structured / deterministic problem
        ↓
Traditional software logic

Unstructured / language-heavy problem
        ↓
AI / LLM
```

## Why

This improves:

- Reliability
- Explainability
- Predictability
- Testing
- Cost control

## Status

Accepted.

---

# 12. AI Should Be Introduced Progressively

## Decision

BestBank will introduce AI in stages.

Target progression:

```text
Document
   ↓
AI Information Extraction
   ↓
Validation
   ↓
RAG
   ↓
Tools
   ↓
Agent Workflow
   ↓
Controlled Autonomy
```

## Why

This allows the project to demonstrate the evolution from traditional software engineering into AI systems engineering.

The objective is not simply to call an LLM.

The objective is to build a reliable system around AI.

## Status

Accepted.

---

# 13. Agent Framework Will Not Be Introduced Prematurely

## Decision

Do not introduce an agent framework before the underlying workflow and tool architecture are understood.

## Why

A framework can hide important concepts such as:

- State
- Tool execution
- Routing
- Retries
- Permissions
- Error handling
- Human approval
- Workflow transitions

BestBank should first understand and implement these concepts explicitly.

A framework can be introduced later if it provides meaningful benefits.

## Principle

```text
Understand the architecture
        ↓
Implement the core concepts
        ↓
Identify real complexity
        ↓
Introduce a framework if justified
```

## Status

Accepted.

---

# 14. Human-in-the-Loop for Important Decisions

## Decision

The AI system should not automatically make every important banking decision.

Human approval will be included where required.

Target flow:

```text
AI processes information
        ↓
AI generates recommendation / validation result
        ↓
Human reviews
        ↓
Human approves / rejects / requests correction
```

## Why

Banking workflows can involve:

- Financial risk
- Regulatory requirements
- Incomplete information
- Ambiguous documents
- Exceptional cases

Human oversight provides an escalation mechanism when the AI system is uncertain or when business policy requires human authorization.

## Status

Accepted.

---

# 15. Controlled Autonomy

## Decision

Autonomy should be introduced gradually rather than giving the AI unrestricted control.

Target model:

```text
Level 0
Human performs everything

Level 1
AI assists human

Level 2
AI recommends actions

Level 3
AI executes low-risk actions

Level 4
AI executes workflows with defined boundaries

Level 5
AI operates autonomously within strict policies
and escalates exceptions to humans
```

The exact autonomy levels may evolve as the project develops.

## Why

Autonomous systems require:

- Permissions
- Guardrails
- Observability
- Evaluation
- Failure handling
- Human escalation

Autonomy is therefore treated as an engineering capability, not simply an LLM feature.

## Status

Accepted.

---

# 16. Human Approval as a System Capability

## Decision

Human-in-the-loop is treated as part of the system architecture rather than as a manual workaround.

The system should eventually support:

```text
AI Workflow
    ↓
Risk / Uncertainty / Policy Check
    ↓
Human Approval Required?
    ├── No → Continue
    └── Yes → Human Review
                    ↓
             Approve / Reject / Modify
```

## Why

This allows autonomous workflows to safely handle exceptions.

## Status

Accepted.

---

# 17. Tool Execution Must Be Controlled

## Decision

AI agents will not receive unrestricted access to system capabilities.

Tools should have defined:

- Purpose
- Input schema
- Output schema
- Permissions
- Validation
- Error handling
- Logging
- Audit information

Example:

```text
Agent
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

## Why

An AI model should not be trusted simply because it generated a tool call.

The surrounding system must enforce boundaries.

## Status

Accepted.

---

# 18. AI Evaluation Is a Required Engineering Layer

## Decision

AI features will be evaluated using measurable metrics.

Potential metrics include:

- Extraction accuracy
- Validation accuracy
- Retrieval quality
- Groundedness
- Hallucination rate
- Tool selection accuracy
- Workflow success rate
- Failure rate
- Latency
- Cost
- Human override rate

## Why

Traditional software can often be tested with deterministic expected outputs.

AI systems can produce variable outputs.

Therefore evaluation must become an explicit engineering discipline.

## Status

Accepted.

---

# 19. Observability Is Part of the Architecture

## Decision

BestBank will eventually include observability across both traditional software and AI workflows.

Important signals include:

```text
Logs
Metrics
Traces
Errors
Latency
Token usage
Model usage
Tool calls
Workflow state
Human interventions
```

## Why

When an autonomous AI workflow fails, developers need to understand:

```text
What happened?
        ↓
Which model was used?
        ↓
What information was provided?
        ↓
Which tool was selected?
        ↓
What tool result was returned?
        ↓
What decision did the workflow make?
        ↓
Where did the failure occur?
```

Without observability, debugging AI systems becomes extremely difficult.

## Status

Accepted as a future production requirement.

---

# 20. Security Must Surround the AI System

## Decision

Security is treated as a system-wide concern.

Future security requirements include:

- Authentication
- Authorization
- Input validation
- Secure secrets management
- SQL injection protection
- API security
- Prompt injection protection
- Tool permission boundaries
- Data access controls
- Audit logging
- Sensitive-data protection

## Principle

Security should not be added only after the AI functionality is complete.

It should be considered as the architecture evolves.

## Status

Accepted.

---

# 21. Business Logic Should Not Live Entirely in API Endpoints

## Decision

As the backend grows, business logic should be separated from FastAPI route handlers.

Target architecture:

```text
API Layer
    ↓
Service Layer
    ↓
Repository / Data Access Layer
    ↓
Database
```

## Why

This improves:

- Testability
- Maintainability
- Separation of concerns
- Reusability
- Future scalability

The current implementation is intentionally simpler because the project is still in the backend foundation stage.

## Status

Accepted as the next backend evolution.

---

# 22. The Architecture Must Support Future AI Workflows

## Decision

Current backend design should not unnecessarily block future AI capabilities.

The system should eventually support:

```text
API
 ↓
Application Services
 ↓
Document Processing
 ↓
AI Extraction
 ↓
Validation
 ↓
RAG
 ↓
Tool Layer
 ↓
Agent Workflow
 ↓
Human Approval
 ↓
Audit / Evaluation / Observability
```

## Why

The current backend is the foundation for the eventual agentic system.

The architecture therefore needs to evolve without unnecessary rewrites.

## Status

Accepted.

---

# 23. Technology Should Be Added Only When Justified

## Decision

Do not add technologies simply because they are commonly used in AI projects.

Potential future technologies should be introduced only when the problem requires them.

Examples:

```text
Vector database
→ when semantic retrieval becomes necessary

Agent framework
→ when workflow complexity justifies it

Message queue
→ when asynchronous processing requires it

Redis
→ when caching/state/rate limiting requires it

Cloud services
→ when deployment requirements justify them
```

## Why

Technology should solve a real problem.

More technologies do not automatically produce a better architecture.

## Status

Accepted.

---

# 24. Source-of-Truth Decision

## Decision

The GitHub repository is the persistent source of truth for the BestBank project.

Important project knowledge is stored under:

```text
docs/
```

including:

```text
PROJECT_CONTEXT.md
CURRENT_STATE.md
ARCHITECTURE.md
DECISIONS.md
ROADMAP.md
LEARNING_LOG.md
TODO.md
```

## Why

The repository provides durable project context that can be reviewed in future sessions.

## Rule

After major project changes:

```text
Implement
   ↓
Test
   ↓
Update project documentation
   ↓
Commit
   ↓
Push
```

## Status

Accepted.

---

# 25. Current Architecture Decision Summary

| Area | Decision |
|---|---|
| Language | Python |
| Backend | FastAPI |
| API style | REST |
| Database | PostgreSQL |
| ORM / DB layer | SQLAlchemy |
| Validation | Pydantic |
| Identifiers | UUID |
| Financial values | NUMERIC / Decimal |
| Configuration | Environment variables |
| Architecture | Incremental |
| Business logic | Deterministic where appropriate |
| AI | Introduced progressively |
| Agents | Added after workflow fundamentals |
| Autonomy | Controlled |
| Human oversight | Human-in-the-loop |
| Tools | Permission-controlled |
| AI evaluation | Required |
| Observability | Required |
| Security | System-wide requirement |
| Documentation | GitHub repository source of truth |

---

# 26. Decision Evolution Rule

These decisions are not permanent.

If a future requirement reveals that a decision should change, the change should be documented.

Use the following format:

```text
Previous Decision
        ↓
New Requirement / Evidence
        ↓
Trade-off Analysis
        ↓
New Decision
        ↓
Update ARCHITECTURE.md
        ↓
Update DECISIONS.md
        ↓
Implement
        ↓
Test
        ↓
Commit
        ↓
Push
```

The goal is not to avoid changing architecture.

The goal is to make architectural changes **deliberate, explainable, and traceable**.

---

# Final Principle

BestBank is being built to demonstrate the progression:

```text
Software Engineering
        ↓
Backend Engineering
        ↓
AI Engineering
        ↓
Agent Engineering
        ↓
Autonomous AI Systems
        ↓
AI Systems Engineering
```

The purpose of these decisions is to ensure that every technology and architectural choice contributes to that progression rather than adding complexity without purpose.