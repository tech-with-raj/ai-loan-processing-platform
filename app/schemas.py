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