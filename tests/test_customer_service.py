import uuid

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