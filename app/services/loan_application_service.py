import uuid

from sqlalchemy.orm import Session

from app.enums import ApplicationStatus
from app.models import Customer, LoanApplication
from app.schemas import LoanApplicationCreate


class LoanApplicationService:

    @staticmethod
    def create_application(
        db: Session,
        application: LoanApplicationCreate,
    ) -> LoanApplication:

        if db.get(Customer, application.customer_id) is None:
            raise ValueError("Customer not found")

        new_application = LoanApplication(
            application_id=uuid.uuid4(),
            customer_id=application.customer_id,
            loan_type=application.loan_type.value,
            loan_amount=application.loan_amount,
            status=ApplicationStatus.CREATED,
        )

        db.add(new_application)
        db.commit()
        db.refresh(new_application)

        return new_application