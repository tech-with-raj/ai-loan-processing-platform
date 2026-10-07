import uuid

from sqlalchemy.orm import Session

from app.enums import ApplicationStatus
from sqlalchemy.exc import SQLAlchemyError
from app.exceptions import (
    ApplicationNotFoundError,
    CustomerNotFoundError,
    DatabaseOperationError,
)
from app.models import Customer, LoanApplication
from app.schemas import LoanApplicationCreate


class LoanApplicationService:
    @staticmethod
    def create_application(
        db: Session,
        application: LoanApplicationCreate,
    ) -> LoanApplication:
        if db.get(Customer, application.customer_id) is None:
            raise CustomerNotFoundError("Customer not found")

        new_application = LoanApplication(
            application_id=uuid.uuid4(),
            customer_id=application.customer_id,
            loan_type=application.loan_type.value,
            loan_amount=application.loan_amount,
            status=ApplicationStatus.CREATED,
        )

        db.add(new_application)
        try:
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise DatabaseOperationError(
                "Database operation failed"
            ) from exc
        db.refresh(new_application)

        return new_application

    @staticmethod
    def get_application(
        db: Session,
        application_id: uuid.UUID,
    ) -> LoanApplication:
        application = db.get(LoanApplication, application_id)

        if application is None:
            raise ApplicationNotFoundError("Loan application not found")

        return application