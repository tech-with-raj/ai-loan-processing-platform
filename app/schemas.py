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

class LoanApplication(BaseModel):
    customer_name: str
    loan_type: str
    loan_amount: float

class LoanApplicationResponse(BaseModel):
    application_id: str
    status: str 