import uuid

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import API_KEY
from app.database import get_db
from app.enums import ApplicationStatus
from app.models import Customer, LoanApplication
from app.schemas import (
    CustomerCreate,
    CustomerResponse,
    LoanApplicationCreate,
    LoanApplicationResponse,
)

app = FastAPI(title="BestBank API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if API_KEY is not None and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


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
    _: None = Depends(require_api_key),
):
    if db.get(Customer, application.customer_id) is None:
        raise HTTPException(status_code=404, detail="Customer not found")

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



@app.post("/customers", response_model=CustomerResponse, status_code=201)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_api_key),
):
    new_customer = Customer(
        customer_id=uuid.uuid4(),
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@app.get("/customers", response_model=list[CustomerResponse])
def get_customers(
    db: Session = Depends(get_db),
    _: None = Depends(require_api_key),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    customers = db.query(Customer).order_by(Customer.created_at.desc()).offset(offset).limit(limit).all()
    return customers



@app.get(
    "/applications",
    response_model=list[LoanApplicationResponse],
)
def get_applications(
    db: Session = Depends(get_db),
    _: None = Depends(require_api_key),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    applications = (
        db.query(LoanApplication)
        .order_by(LoanApplication.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return applications