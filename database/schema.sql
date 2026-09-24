CREATE TYPE application_status AS ENUM (
    'CREATED', 'DOCUMENTS_PENDING', 'PROCESSING', 'VALIDATION',
    'REVIEW', 'APPROVED', 'REJECTED'
);

CREATE TABLE customers (
    customer_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loan_applications (
    application_id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    loan_amount NUMERIC(15,2) NOT NULL,
    status application_status NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_loan_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
);