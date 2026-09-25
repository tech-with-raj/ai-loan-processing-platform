# BestBank — Learning Log

This document records the concepts, engineering skills, and practical lessons learned while building BestBank.

The purpose is to track **actual learning through implementation**, not simply list technologies used by the project.

The learning process follows:

```text
Learn
  ↓
Understand
  ↓
Implement
  ↓
Test
  ↓
Debug
  ↓
Explain
  ↓
Document
  ↓
Apply
```

---

# 1. Learning Philosophy

BestBank is being used as a practical learning environment for becoming an:

**AI Systems Engineer specializing in Agentic AI / Autonomous AI Systems.**

Learning will happen progressively.

We do not need to master every technology before building.

Instead:

```text
Understand the problem
        ↓
Learn the minimum required concept
        ↓
Implement it
        ↓
Understand what happened
        ↓
Debug failures
        ↓
Improve the implementation
        ↓
Document the learning
```

---

# 2. Current Learning Stage

Current stage:

```text
Backend Engineering Foundation
```

Primary technologies currently being learned:

- Python
- FastAPI
- REST APIs
- PostgreSQL
- SQL
- SQLAlchemy
- Pydantic
- Git/GitHub
- Backend architecture

Future learning areas:

- Document processing
- LLMs
- Structured AI outputs
- RAG
- Embeddings
- Tool calling
- Agentic workflows
- Human-in-the-loop
- Autonomous systems
- AI evaluation
- AI security
- AI observability
- Docker
- Cloud
- CI/CD

---

# 3. Python

## Concepts learned

Python is the primary programming language for BestBank.

Important concepts being developed:

- Functions
- Classes
- Modules
- Imports
- Type hints
- Exceptions
- Environment configuration
- Object-oriented programming

## Why Python

Python provides strong support for both:

```text
Software Engineering
        +
AI Engineering
```

This allows the same language to be used across the BestBank architecture.

## Status

Foundation established.

Further learning will happen as project complexity increases.

---

# 4. FastAPI

## Concepts learned

FastAPI is being used to create the BestBank backend API.

Basic concepts learned:

- FastAPI application
- Routes
- HTTP methods
- Request models
- Response models
- Dependency injection
- API documentation
- CORS

## Example

A loan application endpoint:

```text
POST /applications
```

receives application information and stores it in the database.

## Important learning

An API endpoint is not the entire backend architecture.

As the system grows, the endpoint should delegate work to appropriate application/business services.

Target:

```text
API Endpoint
      ↓
Service
      ↓
Database Access
```

## Status

Foundation established.

## Service Layer Refactoring

The service layer refactor reinforced these concepts:

- Separation of concerns
- Service layer responsibilities
- Business logic versus API logic
- Refactoring without changing behavior
- Test verification after structural changes

Customer and loan application creation now delegate from the API layer to services, keeping business logic separate from request handling while preserving existing behavior.

---

# 5. REST APIs

## Concepts learned

BestBank uses REST-style HTTP APIs to communicate with clients.

Important concepts:

- HTTP
- GET
- POST
- Request body
- Response body
- Status codes
- Resource-oriented design

Examples:

```text
GET /customers
GET /applications
POST /applications
```

## Important learning

The API is a boundary between clients and backend services.

The API should expose business capabilities without exposing internal implementation details unnecessarily.

## Status

Foundation established.

---

# 6. PostgreSQL

## Concepts learned

PostgreSQL is the primary relational database for BestBank.

Important concepts:

- Database
- Tables
- Rows
- Columns
- Primary keys
- Foreign keys
- Constraints
- Data types
- Transactions
- Relationships
- SQL queries

## Why PostgreSQL was selected

BestBank contains strongly relational business data.

For example:

```text
Customer
   |
   └── Loan Applications
          |
          └── Documents
                 |
                 └── Validation Results
```

PostgreSQL provides strong relational capabilities for this type of system.

## Status

Foundation established.

Further learning will continue as more complex data models are introduced.

---

# 7. SQL

## Concepts learned

SQL is used to interact with relational databases.

Important concepts:

- CREATE TABLE
- INSERT
- SELECT
- UPDATE
- DELETE
- WHERE
- JOIN
- Constraints
- Foreign keys
- Data types

## Important learning

Using an ORM does not eliminate the need to understand SQL.

The goal is:

```text
Understand SQL
      +
Use SQLAlchemy effectively
```

rather than treating the ORM as a black box.

## Status

Foundation established.

---

# 8. Database Modeling

BestBank currently contains entities such as:

```text
Customer
Loan Application
```

The relationship is:

```text
Customer
   |
   | 1
   |
   | many
   ↓
Loan Application
```

A customer can therefore have multiple loan applications.

## Important learning

Database design should represent the actual business domain.

The database should not simply be designed around whatever is easiest to code.

## Status

Foundation established.

---

# 9. Primary Keys

## Concepts learned

A primary key uniquely identifies a database record.

BestBank uses UUID identifiers.

Examples:

```text
customer_id
application_id
```

## Important learning

An identifier is not the same thing as the business data itself.

For example:

```text
application_id
```

identifies the application.

The application attributes contain:

```text
loan_type
loan_amount
status
created_at
```

## Status

Understood and implemented.

---

# 10. UUID

## Concept learned

UUID stands for:

**Universally Unique Identifier**

Python can generate UUIDs using:

```python
uuid.uuid4()
```

Example conceptual flow:

```text
Create application
        ↓
Generate UUID
        ↓
Store UUID as application_id
```

## Why UUID is useful

UUIDs provide unique identifiers suitable for distributed systems and future system growth.

## Status

Understood and implemented.

---

# 11. Foreign Keys

## Concepts learned

A foreign key connects related database records.

BestBank uses:

```text
loan_applications.customer_id
```

as a foreign key referencing:

```text
customers.customer_id
```

Relationship:

```text
Customer
customer_id
    ↑
    |
    |
loan_applications.customer_id
```

## Important learning

Foreign keys help maintain referential integrity.

A loan application should reference a valid customer.

## Status

Understood and implemented.

---

# 12. SQLAlchemy

## Concepts learned

SQLAlchemy provides the application-level database interface.

BestBank uses SQLAlchemy models such as:

```text
Customer
LoanApplication
```

The architecture is:

```text
FastAPI
   ↓
SQLAlchemy
   ↓
PostgreSQL
```

## Important learning

SQLAlchemy provides abstraction, but understanding the underlying database remains important.

## Status

Foundation established.

---

# 13. Database Sessions

## Concept learned

A database session manages interaction with the database.

BestBank uses a session dependency:

```text
API request
    ↓
Database session
    ↓
Database operations
    ↓
Commit / rollback
    ↓
Close session
```

## Important learning

Database connections and sessions must be managed correctly.

Leaving database resources open can create reliability and scalability problems.

## Status

Understood and implemented at the foundation level.

---

# 14. Pydantic

## Concepts learned

Pydantic is used for request and response validation.

BestBank uses schemas such as:

```text
LoanApplicationCreate
LoanApplicationResponse
CustomerResponse
```

## Important distinction

Database models and API schemas serve different purposes.

```text
SQLAlchemy Model
        ↓
Database representation

Pydantic Schema
        ↓
API data representation
```

Keeping these concerns separate improves maintainability.

## Status

Foundation established.

---

# 15. Environment Variables

## Concept learned

Configuration should not be hard-coded into application source code.

BestBank uses:

```text
DATABASE_URL
```

to configure database connectivity.

Conceptual flow:

```text
Environment
    ↓
Configuration
    ↓
Database connection
```

## Important learning

Configuration should vary by environment without requiring source-code changes.

Examples:

```text
Development
Testing
Production
```

can use different configurations.

## Status

Implemented.

---

# 16. CORS

## Concept learned

CORS controls which browser origins can interact with the API.

BestBank currently allows local frontend development origins.

This enables:

```text
Frontend
   ↓
FastAPI
```

during local development.

## Future learning

Production CORS configuration must be more restrictive and environment-specific.

## Status

Basic implementation established.

---

# 17. Git and GitHub

## Concepts learned

Git is being used for source-code version control.

GitHub is being used as the persistent project repository.

Important workflow:

```text
Change
  ↓
Test
  ↓
git add
  ↓
git commit
  ↓
git push
```

## Project documentation

Important architecture knowledge is stored inside:

```text
docs/
```


## Status

Actively used.

---

# 18. Architecture Thinking

One of the most important lessons from BestBank is that building software is not only about writing code.

We must understand:

```text
Why does this component exist?
        ↓
What responsibility does it have?
        ↓
What does it depend on?
        ↓
What depends on it?
        ↓
How will it evolve?
```

Current architecture:

```text
Client
  ↓
FastAPI
  ↓
SQLAlchemy
  ↓
PostgreSQL
```

Future architecture:

```text
Client
  ↓
API
  ↓
Services
  ↓
AI / RAG / Tools / Agents
  ↓
Data + External Systems
```

## Status

Ongoing.

---

# 19. Deterministic Logic vs AI

Important principle learned:

**Not every problem requires AI.**

Example:

```text
loan_amount > approved_limit
```

is a deterministic business rule.

It should normally be implemented using conventional software logic.

AI becomes useful for problems such as:

```text
Read an unstructured document
        ↓
Understand its contents
        ↓
Extract relevant information
```

This distinction is central to AI Systems Engineering.

## Status

Concept established.

---

# 20. AI Engineering — Future Learning

The following topics will be learned when the project reaches the AI stages.

## LLM Fundamentals

- Tokens
- Context windows
- Prompting
- Model selection
- Temperature
- Structured outputs
- JSON schemas
- Streaming

## LLM Integration

- API calls
- Authentication
- Error handling
- Retries
- Timeouts
- Rate limits
- Cost management

## Status

Not yet implemented.

---

# 21. RAG — Future Learning

Topics to learn:

- Embeddings
- Vector search
- Chunking
- Metadata
- Retrieval
- Similarity
- Top-k results
- Context construction
- Grounded generation
- Retrieval evaluation

Target architecture:

```text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Relevant Documents
   ↓
LLM
   ↓
Grounded Answer
```

## Status

Future phase.

---

# 22. Tool Calling — Future Learning

Topics to learn:

- Tool schemas
- Function calling
- Input validation
- Permissions
- Tool execution
- Tool errors
- Tool result validation
- Audit logging

Target architecture:

```text
AI
 ↓
Tool Selection
 ↓
Permission Check
 ↓
Validation
 ↓
Execution
 ↓
Result
```

## Status

Future phase.

---

# 23. Agentic AI — Future Learning

Agentic AI learning will include:

- State
- Goals
- Planning
- Routing
- Tool use
- Conditional workflows
- Memory
- Retries
- Fallbacks
- Human escalation

Important principle:

```text
Agent
≠
LLM + Prompt
```

A production agentic system requires surrounding engineering infrastructure.

## Status

Future phase.

---

# 24. Autonomous AI Systems — Future Learning

Future capabilities:

- Controlled autonomy
- Permission boundaries
- Guardrails
- Risk classification
- Policy enforcement
- Human escalation
- Failure recovery
- Long-running workflows
- State management
- Evaluation
- Observability

Target:

```text
AI reasons
   ↓
AI chooses an action
   ↓
System validates the action
   ↓
AI executes through permitted tools
   ↓
System observes the result
   ↓
AI continues / retries / escalates
```

## Status

Future phase.

---

# 25. AI Evaluation — Future Learning

AI systems need measurable evaluation.

Topics:

- Golden datasets
- Evaluation datasets
- Accuracy
- Retrieval quality
- Groundedness
- Hallucination
- Tool selection accuracy
- Workflow success
- Regression testing
- LLM-as-judge concepts
- Cost
- Latency

## Status

Future phase.

---

# 26. AI Security — Future Learning

Topics:

- Prompt injection
- Data leakage
- Authorization
- Tool permissions
- Secrets
- Input validation
- Output validation
- Audit logging
- Model abuse
- Access control

Important principle:

```text
The LLM should not be trusted
to enforce its own permissions.
```

The surrounding software system must enforce boundaries.

## Status

Future phase.

---

# 27. Observability — Future Learning

Topics:

- Structured logging
- Metrics
- Tracing
- Error tracking
- Token usage
- Model latency
- Tool calls
- Workflow state
- Human interventions

Target:

```text
AI System
   ↓
Logs
Metrics
Traces
Audits
Evaluations
```

## Status

Future phase.

---

# 28. Docker, Cloud and CI/CD — Future Learning

Topics:

- Docker
- Docker Compose
- Containers
- Networking
- Environment configuration
- CI/CD
- Cloud deployment
- Health checks
- Production configuration

Preferred cloud direction:

**AWS**

## Status

Future phase.

---

# 29. Major Learning Milestones

## Milestone 1 — Backend Foundation

Learned:

- FastAPI
- REST
- PostgreSQL
- SQL
- SQLAlchemy
- Pydantic
- UUID
- Foreign keys
- Database sessions
- Environment configuration

Status:

**Completed**

---

## Milestone 2 — Production Backend

Target learning:

- Service layer
- Error handling
- Testing
- API design
- Logging
- Database transactions

Status:

**Next**

---

## Milestone 3 — AI Engineering

Target learning:

- LLM APIs
- Structured outputs
- Document extraction
- AI validation

Status:

**Future**

---

## Milestone 4 — RAG

Target learning:

- Embeddings
- Retrieval
- Vector search
- Grounded generation

Status:

**Future**

---

## Milestone 5 — Agent Engineering

Target learning:

- Tools
- State
- Workflows
- Routing
- Planning
- Human-in-the-loop

Status:

**Future**

---

## Milestone 6 — Autonomous Systems

Target learning:

- Controlled autonomy
- Guardrails
- Permissions
- Evaluation
- Observability
- Failure recovery

Status:

**Future**

---

# 30. Learning Through Failure

Failures are part of the learning process.

When something breaks:

```text
Error
 ↓
Understand the error
 ↓
Identify root cause
 ↓
Fix
 ↓
Understand why the fix worked
 ↓
Document the lesson
```

The goal is not merely to make the error disappear.

The goal is to understand the underlying engineering concept.

---

# 31. Interview Readiness

BestBank should eventually provide practical examples for interview discussions.

For every major technology, we should be able to explain:

```text
What is it?
Why did we use it?
What problem does it solve?
What alternatives exist?
What are the trade-offs?
How did we implement it?
What problems did we encounter?
How did we test it?
How would we improve it?
```

This transforms project experience into interview-ready engineering knowledge.

---

# 32. AI Systems Engineering Capability

The ultimate learning objective is to understand how the pieces fit together:

```text
Software Engineering
        +
Backend Engineering
        +
AI Engineering
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

The goal is to become capable of designing and building complete AI systems rather than only interacting with AI models.

---

# 33. Learning Log Update Rule

Whenever a significant concept is learned:

1. Record the concept.
2. Explain what was learned.
3. Record how it was implemented.
4. Record important mistakes or lessons.
5. Record the practical engineering implication.
6. Update the relevant project documentation.
7. Commit and push the changes.

---

# 34. Current Learning Summary

BestBank has already moved beyond simply learning isolated technologies.

The project has started connecting:

```text
Python
  ↓
FastAPI
  ↓
REST API
  ↓
PostgreSQL
  ↓
SQLAlchemy
  ↓
Database Models
  ↓
Pydantic
  ↓
Git/GitHub
  ↓
System Architecture
```

The next major transition is:

```text
Backend Engineering
        ↓
Production Backend Engineering
        ↓
AI Engineering
```

From there:

```text
AI Engineering
        ↓
Agent Engineering
        ↓
Autonomous AI Systems
        ↓
AI Systems Engineering
```

---

# 35. Final Learning Principle

The objective is not:

```text
Learn every AI technology.
```

The objective is:

```text
Understand problems
        ↓
Design systems
        ↓
Build reliable solutions
        ↓
Use AI where it adds value
        ↓
Control AI with software
        ↓
Evaluate AI behavior
        ↓
Secure the system
        ↓
Observe the system
        ↓
Operate the system
```

That is the core learning path toward becoming an **AI Systems Engineer**.