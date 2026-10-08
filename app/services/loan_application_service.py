import uuid

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.enums import (
    APPLICATION_STATUS_TRANSITIONS,
    ApplicationStatus,
    can_transition,
)
from app.exceptions import (
    ApplicationNotFoundError,
    CustomerNotFoundError,
    DatabaseOperationError,
    InvalidApplicationStatusTransitionError,
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

    @staticmethod
    def update_application_status(
        db: Session,
        application_id: uuid.UUID,
        target_status: ApplicationStatus,
    ) -> LoanApplication:
        application = LoanApplicationService.get_application(db, application_id)

        if not can_transition(
            APPLICATION_STATUS_TRANSITIONS,
            application.status,
            target_status,
        ):
            raise InvalidApplicationStatusTransitionError(
                "Cannot transition application status "
                f"from {application.status.value} to {target_status.value}"
            )

        application.status = target_status
        try:
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise DatabaseOperationError(
                "Database operation failed"
            ) from exc
        db.refresh(application)

        return application