import uuid

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.exceptions import (
    DatabaseOperationError,
    DuplicateCustomerError,
)
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

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise DuplicateCustomerError(
                "Customer with this email already exists"
            ) from exc
        except SQLAlchemyError as exc:
            db.rollback()
            raise DatabaseOperationError(
                "Database operation failed"
            ) from exc
            
        db.refresh(new_customer)
        return new_customer   