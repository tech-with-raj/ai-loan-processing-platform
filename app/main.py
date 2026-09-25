from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import API_KEY
from app.database import get_db
from app.models import Customer, LoanApplication
from app.schemas import (
    CustomerCreate,
    CustomerResponse,
    LoanApplicationCreate,
    LoanApplicationResponse,
)
from app.services.customer_service import CustomerService
from app.services.loan_application_service import LoanApplicationService


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


@app.post("/applications", status_code=201, response_model=LoanApplicationResponse)
def create_application(
    application: LoanApplicationCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_api_key),
):
    try:
        return LoanApplicationService.create_application(db, application)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))



@app.post("/customers", response_model=CustomerResponse, status_code=201)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_api_key),
):
    
    return CustomerService.create_customer(db,customer)


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