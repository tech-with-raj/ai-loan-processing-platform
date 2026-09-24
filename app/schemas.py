import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field

from app.enums import ApplicationStatus


class LoanType(str, Enum):
    PERSONAL = "Personal Loan"
    HOME = "Home Loan"
    VEHICLE = "Vehicle Loan"
    BUSINESS = "Business Loan"


class CustomerResponse(BaseModel):
    customer_id: uuid.UUID
    name: str
    email: str
    phone: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)
    phone: str | None = Field(default=None, max_length=20)


class LoanApplicationCreate(BaseModel):
    customer_id: uuid.UUID
    loan_type: LoanType
    loan_amount: Decimal = Field(
        gt=0,
        lt=Decimal("10000000000000"),
        max_digits=15,
        decimal_places=2,
    )


class LoanApplicationResponse(BaseModel):
    application_id: uuid.UUID
    customer_id: uuid.UUID
    loan_type: LoanType
    loan_amount: Decimal
    status: ApplicationStatus
    created_at: datetime

    model_config = {
        "from_attributes": True
    }