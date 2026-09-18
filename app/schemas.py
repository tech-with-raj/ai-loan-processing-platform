import uuid
from datetime import datetime

from pydantic import BaseModel


class CustomerResponse(BaseModel):
    customer_id: uuid.UUID
    name: str
    email: str
    phone: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class LoanApplicationCreate(BaseModel):
    customer_id: uuid.UUID
    loan_type: str
    loan_amount: float


class LoanApplicationResponse(BaseModel):
    application_id: uuid.UUID
    customer_id: uuid.UUID
    loan_type: str
    loan_amount: float
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }