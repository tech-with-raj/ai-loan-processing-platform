import uuid

import pytest

from app.exceptions import DuplicateCustomerError
from app.schemas import CustomerCreate
from app.services.customer_service import CustomerService


def test_create_customer(db_session):
    customer = CustomerCreate(
        name="Test Customer",
        email=f"{uuid.uuid4()}@example.com",
        phone="9876543210",
    )

    result = CustomerService.create_customer(db_session, customer)

    assert result.customer_id is not None
    assert result.name == "Test Customer"
    assert result.email == customer.email
    assert result.phone == "9876543210"



def test_create_customer_rejects_duplicate_email(db_session):
    email = "duplicate@example.com"

    first_customer = CustomerCreate(
        name="First Customer",
        email=email,
        phone="9876543210",
    )

    CustomerService.create_customer(
        db_session,
        first_customer,
    )

    second_customer = CustomerCreate(
        name="Second Customer",
        email=email,
        phone="9876543211",
    )

    with pytest.raises(
        DuplicateCustomerError,
        match="Customer with this email already exists",
    ):
        CustomerService.create_customer(
            db_session,
            second_customer,
        )