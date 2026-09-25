import uuid

from sqlalchemy.orm import Session

from app.models import Customer
from app.schemas import CustomerCreate


class CustomerService:

    @staticmethod
    def create_customer(
        db: Session,
        customer: CustomerCreate,
    ) -> Customer:
        new_customer = Customer(
            customer_id=uuid.uuid4(),
            name=customer.name,
            email=customer.email,
            phone=customer.phone,
        )

        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)

        return new_customer