import uuid

from fastapi import FastAPI
from pydantic import BaseModel

from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, LoanApplication
from app.schemas import (
    CustomerResponse,
    LoanApplicationCreate,
    LoanApplicationResponse,
)

app = FastAPI(title="BestBank API")   


@app.get("/")
def root():
    return {"message": "BestBank API is running"}


@app.post(
    "/applications",
    status_code=201,
    response_model=LoanApplicationResponse,
)
def create_application(
    application: LoanApplicationCreate,
    db: Session = Depends(get_db),
):
    new_application = LoanApplication(
        application_id=uuid.uuid4(),
        customer_id=application.customer_id,
        loan_type=application.loan_type,
        loan_amount=application.loan_amount,
        status="CREATED",
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application



@app.get("/customers", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return customers



@app.get(
    "/applications",
    response_model=list[LoanApplicationResponse],
)
def get_applications(
    db: Session = Depends(get_db),
):
    applications = db.query(LoanApplication).all()
    return applications