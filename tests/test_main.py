import uuid
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.enums import (
    APPLICATION_STATUS_TRANSITIONS,
    ApplicationStatus,
    can_transition,
)
from app.main import app


@pytest.fixture()
def client():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    except OperationalError:
        pytest.skip("PostgreSQL is required; start it with docker compose up -d postgres")
    finally:
        app.dependency_overrides.clear()
        session.close()
        transaction.rollback()
        connection.close()


def create_customer(client: TestClient) -> str:
    response = client.post(
        "/customers",
        json={"name": "Test Customer", "email": f"{uuid.uuid4()}@example.com"},
    )
    assert response.status_code == 201
    return response.json()["customer_id"]


def test_root(client):
    assert client.get("/").json() == {"message": "BestBank API is running"}


def test_rejects_unknown_loan_type(client):
    response = client.post("/applications", json={
        "customer_id": str(uuid.uuid4()), "loan_type": "lol", "loan_amount": "50000.00"
    })
    assert response.status_code == 422


@pytest.mark.parametrize("amount", ["-1", "0", "0.001", "10000000000000", "1e20"])
def test_rejects_invalid_loan_amounts(client, amount):
    response = client.post("/applications", json={
        "customer_id": str(uuid.uuid4()), "loan_type": "Personal Loan", "loan_amount": amount
    })
    assert response.status_code == 422


def test_rejects_loan_type_longer_than_enum(client):
    response = client.post("/applications", json={
        "customer_id": str(uuid.uuid4()), "loan_type": "x" * 200, "loan_amount": "50000.00"
    })
    assert response.status_code == 422


def test_unknown_customer_is_not_an_integrity_error(client):
    response = client.post("/applications", json={
        "customer_id": str(uuid.uuid4()), "loan_type": "Personal Loan", "loan_amount": "50000.00"
    })
    assert response.status_code == 404


def test_customer_without_phone_is_listable(client):
    customer_id = create_customer(client)
    response = client.get("/customers")
    assert response.status_code == 200
    assert next(item for item in response.json() if item["customer_id"] == customer_id)["phone"] is None


def test_created_at_is_generated_for_customers(client):
    customer_id = create_customer(client)
    customer = next(item for item in client.get("/customers").json() if item["customer_id"] == customer_id)
    assert customer["created_at"]


def test_valid_application_returns_decimal_string(client):
    customer_id = create_customer(client)
    response = client.post("/applications", json={
        "customer_id": customer_id, "loan_type": "Personal Loan", "loan_amount": "50000.50"
    })
    assert response.status_code == 201
    assert response.json()["loan_amount"] == "50000.50"


def test_application_list_supports_pagination(client):
    response = client.get("/applications?limit=1&offset=0")
    assert response.status_code == 200
    assert len(response.json()) <= 1


def test_application_status_transitions_are_explicit():
    assert can_transition(
        APPLICATION_STATUS_TRANSITIONS,
        ApplicationStatus.CREATED,
        ApplicationStatus.DOCUMENTS_PENDING,
    )
    assert not can_transition(
        APPLICATION_STATUS_TRANSITIONS,
        ApplicationStatus.CREATED,
        ApplicationStatus.APPROVED,
    )


def test_decimal_has_two_places():
    assert Decimal("50000.50").quantize(Decimal("0.01")) == Decimal("50000.50")