
import uuid
from decimal import Decimal

import pytest
from sqlalchemy.exc import IntegrityError

from app.enums import ApplicationStatus, DocumentStatus
from app.models import Customer, LoanApplication, Document


def create_loan_application(db_session):
    """Create a customer and a loan application for document tests."""

    customer = Customer(
        customer_id=uuid.uuid4(),
        name="Document Test Customer",
        email=f"{uuid.uuid4()}@example.com",
        phone="9876543210",
    )

    db_session.add(customer)
    db_session.flush()

    application = LoanApplication(
        application_id=uuid.uuid4(),
        customer_id=customer.customer_id,
        loan_type="Personal Loan",
        loan_amount=Decimal("50000.00"),
        status=ApplicationStatus.CREATED,
    )

    db_session.add(application)
    db_session.flush()

    return application


def test_create_document_for_existing_application(db_session):
    application = create_loan_application(db_session)

    document = Document(
        document_id=uuid.uuid4(),
        application_id=application.application_id,
        original_filename="salary_slip.pdf",
        content_type="application/pdf",
        storage_key=f"documents/{uuid.uuid4()}/salary_slip.pdf",
    )

    db_session.add(document)
    db_session.flush()

    saved_document = db_session.get(Document, document.document_id)

    assert saved_document is not None
    assert saved_document.application_id == application.application_id
    assert saved_document.original_filename == "salary_slip.pdf"
    assert saved_document.content_type == "application/pdf"
    assert saved_document.status == DocumentStatus.UPLOADED
    assert saved_document.created_at is not None


def test_database_rejects_document_for_missing_application(db_session):
    document = Document(
        document_id=uuid.uuid4(),
        application_id=uuid.uuid4(),  # No application with this ID exists
        original_filename="salary_slip.pdf",
        content_type="application/pdf",
        storage_key=f"documents/{uuid.uuid4()}/salary_slip.pdf",
    )

    db_session.add(document)

    with pytest.raises(IntegrityError):
        db_session.flush()

    db_session.rollback()

    assert db_session.get(Document, document.document_id) is None


def test_database_rejects_duplicate_storage_key(db_session):
    application = create_loan_application(db_session)

    storage_key = f"documents/{uuid.uuid4()}/salary_slip.pdf"

    first_document = Document(
        document_id=uuid.uuid4(),
        application_id=application.application_id,
        original_filename="salary_slip.pdf",
        content_type="application/pdf",
        storage_key=storage_key,
    )

    second_document = Document(
        document_id=uuid.uuid4(),
        application_id=application.application_id,
        original_filename="salary_slip_copy.pdf",
        content_type="application/pdf",
        storage_key=storage_key,
    )

    db_session.add(first_document)
    db_session.flush()

    db_session.add(second_document)

    with pytest.raises(IntegrityError):
        db_session.flush()

    db_session.rollback()

    assert db_session.get(Document, first_document.document_id) is None
    assert db_session.get(Document, second_document.document_id) is None


def test_document_uses_database_defaults(db_session):
    application = create_loan_application(db_session)

    document = Document(
        document_id=uuid.uuid4(),
        application_id=application.application_id,
        original_filename="bank_statement.pdf",
        content_type="application/pdf",
        storage_key=f"documents/{uuid.uuid4()}/bank_statement.pdf",
    )

    db_session.add(document)
    db_session.flush()
    db_session.refresh(document)

    assert document.status == DocumentStatus.UPLOADED
    assert document.created_at is not None
