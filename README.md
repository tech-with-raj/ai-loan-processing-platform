# BestBank - AI-Powered Banking Loan Processing Platform

BestBank is a production-oriented AI application designed to help banking loan officers collect, process, validate, and track loan application documents.

The project is being built as a practical AI Systems Engineering project, combining strong software engineering, backend development, AI engineering, and agentic AI.

---

## Project Goal

Build a secure and reliable AI-powered loan processing workflow that can:

- Manage customer and loan applications
- Collect and process loan documents
- Extract information from documents using AI
- Validate extracted information against application data
- Identify missing or inconsistent documents
- Retrieve relevant banking policies using RAG
- Use controlled AI agents and tools for multi-step workflows
- Support human approval for important decisions
- Provide evaluation and observability
- Deploy using Docker and cloud infrastructure

---

## Business Problem

Loan processing involves several manual and repetitive activities:

1. Collecting customer information
2. Collecting required documents
3. Checking whether documents are missing
4. Extracting information from documents
5. Validating customer information
6. Comparing information across documents
7. Checking banking policies
8. Preparing validation results
9. Sending applications for approval

These activities can be time-consuming and can introduce errors when performed manually.

BestBank aims to automate appropriate parts of this workflow while keeping important decisions under controlled human oversight.

---

## Target Workflow

```text
Customer
   |
   v
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
Validation
   |
   +----------------------+
   |                      |
   v                      v
Missing Documents     Validation Issues
   |                      |
   +----------+-----------+
              |
              v
       Banking Policy RAG
              |
              v
       AI Agent Workflow
              |
              v
      Validation Report
              |
              v
      Human Approval
              |
              v
        Final Decision
```

---

## Technology Direction

```text
Python
   ->
FastAPI
   ->
PostgreSQL
   ->
SQLAlchemy
   ->
LLM APIs
   ->
Document Processing
   ->
RAG
   ->
Tool Calling
   ->
Agent Workflows
   ->
Evaluation
   ->
Observability
   ->
Docker
   ->
AWS
```

The project prioritizes durable engineering concepts over dependence on any single AI framework.

---

## Technology Stack

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

### Database

- PostgreSQL
- SQLAlchemy
- SQL

### AI Engineering

- Large Language Models
- Structured outputs
- Embeddings
- Retrieval-Augmented Generation (RAG)
- Document processing
- Tool/function calling

### Agentic AI

- Agent workflows
- State management
- Tool execution
- Routing
- Conditional workflows
- Retries and fallbacks
- Human-in-the-loop
- Controlled autonomy
- MCP

### Testing

- Pytest
- API testing

### DevOps

- Git
- GitHub
- Docker
- CI/CD
- AWS

## How to Run Locally

### Backend and PostgreSQL

1. Create and activate a virtual environment, then install dependencies:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env`. Start PostgreSQL and apply migrations:

   ```powershell
   docker compose up -d postgres
   python -m alembic upgrade head
   ```

3. Start the API:

   ```powershell
   uvicorn app.main:app --reload
   ```

The API is available at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`. Set `API_KEY` in `.env` before exposing the API
outside localhost; when set, send it as the `X-API-Key` header.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:5173`.

### Tests

Tests use PostgreSQL rather than SQLite because the application relies on
PostgreSQL UUID, enum, and numeric types:

```powershell
python -m pytest -q
```

---

## Project Architecture

The target architecture is designed around clear separation of responsibilities.

```text
                    Client
                      |
                      v
                FastAPI API
                      |
          +-----------+-----------+
          |                       |
          v                       v
     Business Logic          Authentication
          |
          v
      Data Access
          |
          v
      PostgreSQL
          |
          +----------------------+
                                 |
                                 v
                         AI Processing Layer
                                 |
                  +--------------+--------------+
                  |              |              |
                  v              v              v
                LLM            RAG           Tools
                  |              |              |
                  +--------------+--------------+
                                 |
                                 v
                         Agent Workflow
                                 |
                                 v
                        Human Approval
```

---

## AI Processing Strategy

The AI layer will be introduced progressively.

### Stage 1 - Document Extraction

Extract structured information from documents.

Example:

```text
Aadhaar
   |
   v
Document Processing
   |
   v
Extracted Fields
   |
   +-- Name
   +-- Date of Birth
   +-- Aadhaar Number
```

### Stage 2 - Validation

Compare extracted information with application data.

```text
Application Data
       |
       +------+
              |
              v
       Validation Engine
              ^
              |
       Extracted Document Data
```

### Stage 3 - RAG

Retrieve relevant banking policies before generating a validation result.

```text
Question
   |
   v
Retriever
   |
   v
Relevant Policy Documents
   |
   v
LLM
   |
   v
Grounded Response
```

### Stage 4 - Agentic Workflow

The system will use controlled agents to execute appropriate tools and workflows.

```text
Loan Application
       |
       v
Agent
       |
       +--> Check Documents
       |
       +--> Extract Information
       |
       +--> Validate Data
       |
       +--> Retrieve Policy
       |
       +--> Generate Report
       |
       v
Human Approval
```

---

## Controlled AI Autonomy

The system is designed around controlled autonomy rather than unrestricted AI execution.

```text
Human Only
    |
    v
AI Assistance
    |
    v
AI Recommendation
    |
    v
Controlled Execution
    |
    v
Multi-step AI Workflow
```

Important operations should use:

- Permissions
- Guardrails
- Tool restrictions
- Human approval
- Audit logs
- Monitoring
- Error handling
- Rollback strategies

The AI should not receive unlimited authority over banking operations.

---

## Reliability and Security Goals

As the project moves toward production readiness, the system will address:

- Authentication
- Authorization
- Secrets management
- Input validation
- API security
- SQL injection prevention
- Prompt injection protection
- Tool permission boundaries
- Auditability
- Error handling
- Retry strategies
- Rate limiting
- Logging
- Monitoring
- Distributed tracing
- AI evaluation
- Cost monitoring
- Latency monitoring

---

## AI Evaluation

AI functionality will not be considered production-ready simply because the model produces plausible responses.

The system will eventually evaluate:

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

The goal is to measure whether the AI actually improves the business process.

---

## Engineering Principles

This project follows several principles:

### 1. Business First

```text
Business Problem
       |
       v
AI Opportunity
       |
       v
System Design
       |
       v
Implementation
       |
       v
Evaluation
       |
       v
Deployment
       |
       v
Continuous Improvement
```

### 2. AI Where It Adds Value

Not every step needs AI.

Traditional software should be preferred when deterministic rules are sufficient.

AI should be introduced where it provides meaningful value, such as:

- Document understanding
- Information extraction
- Natural-language policy retrieval
- Complex reasoning
- Workflow assistance

### 3. Human-in-the-Loop

Important banking decisions should remain subject to appropriate human oversight.

### 4. Production Mindset

The system considers:

```text
Correctness
Security
Reliability
Observability
Cost
Latency
Scalability
Maintainability
```

---

## Project Philosophy

BestBank is not intended to be just an LLM demo.

The project is being built to demonstrate the ability to take a real business problem and progress through:

```text
Business Problem
       |
       v
Requirements
       |
       v
Backend Engineering
       |
       v
Database Design
       |
       v
AI Engineering
       |
       v
Agentic AI
       |
       v
System Design
       |
       v
Security
       |
       v
Evaluation
       |
       v
Observability
       |
       v
Deployment
       |
       v
Production AI System
```

---

## Current Status

**Under active development**

The project is being developed incrementally, with each milestone adding a production-oriented capability.

---

## Author

**Rajasekar K**

Software Engineer transitioning toward AI Engineering, Agentic AI, and AI Systems Engineering.

---

## License

This project is currently intended as a personal portfolio and learning project.
