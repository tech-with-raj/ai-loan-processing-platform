from unittest.mock import MagicMock
import uuid
from decimal import Decimal

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.enums import ApplicationStatus
from app.exceptions import CustomerNotFoundError, DatabaseOperationError
from app.models import Customer
from app.schemas import LoanApplicationCreate
from app.services.loan_application_service import LoanApplicationService


def create_customer(db_session):
    customer = Customer(
        customer_id=uuid.uuid4(),
        name="Test Customer",
        email=f"{uuid.uuid4()}@example.com",
        phone="9876543210",
    )

    db_session.add(customer)
    db_session.commit()
    db_session.refresh(customer)

    return customer


def test_create_application_for_existing_customer(db_session):
    customer = create_customer(db_session)

    application = LoanApplicationCreate(
        customer_id=customer.customer_id,
        loan_type="Personal Loan",
        loan_amount=Decimal("50000.50"),
    )

    result = LoanApplicationService.create_application(
        db_session,
        application,
    )

    assert result.application_id is not None
    assert result.customer_id == customer.customer_id
    assert result.loan_type == "Personal Loan"
    assert result.loan_amount == Decimal("50000.50")
    assert result.status == ApplicationStatus.CREATED


def test_create_application_for_missing_customer(db_session):
    application = LoanApplicationCreate(
        customer_id=uuid.uuid4(),
        loan_type="Personal Loan",
        loan_amount=Decimal("50000.00"),
    )

    with pytest.raises(CustomerNotFoundError, match="Customer not found"):
        LoanApplicationService.create_application(
            db_session,
            application,
        )
        
        
def test_create_application_rolls_back_on_database_error():
    db = MagicMock()

    customer_id = uuid.uuid4()

    db.get.return_value = Customer(
        customer_id=customer_id,
        name="Test Customer",
        email="database-error@example.com",
        phone="9876543210",
    )

    db.commit.side_effect = SQLAlchemyError("database unavailable")

    application = LoanApplicationCreate(
        customer_id=customer_id,
        loan_type="Personal Loan",
        loan_amount=Decimal("50000.00"),
    )

    with pytest.raises(DatabaseOperationError):
        LoanApplicationService.create_application(
            db,
            application,
        )

    db.rollback.assert_called_once()        