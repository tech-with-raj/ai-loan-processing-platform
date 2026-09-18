import uuid

from fastapi import FastAPI
from pydantic import BaseModel

from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

app = FastAPI(title="BestBank API")


class LoanApplication(BaseModel):
    customer_name: str
    loan_type: str
    loan_amount: float

class LoanApplicationResponse(BaseModel):
    application_id: str
    status: str    


@app.get("/")
def root():
    return {"message": "BestBank API is running"}


@app.post("/applications", status_code=201, response_model=LoanApplicationResponse)
def create_application(application: LoanApplication):
    application_id = f"LN-{uuid.uuid4()}"

    return {
        "application_id": application_id,
        "status": "created"
    }

@app.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM customers"))
    customers = result.mappings().all()

    return customers