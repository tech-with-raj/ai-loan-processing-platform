import uuid
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.database import get_db
from app.enums import (
    APPLICATION_STATUS_TRANSITIONS,
    ApplicationStatus,
    can_transition,
)
from app.exceptions import DatabaseOperationError
from app.main import app
from app.models import LoanApplication


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


def create_customer(client: TestClient) -> str:
    response = client.post(
        "/customers",
        json={"name": "Test Customer", "email": f"{uuid.uuid4()}@example.com"},
    )
    assert response.status_code == 201
    return response.json()["customer_id"]


def create_application(client: TestClient, customer_id: str) -> str:
    response = client.post(
        "/applications",
        json={
            "customer_id": customer_id,
            "loan_type": "Personal Loan",
            "loan_amount": "50000.00",
        },
    )
    assert response.status_code == 201
    return response.json()["application_id"]


def transition_application(
    client: TestClient,
    application_id: str,
    status: ApplicationStatus,
):
    return client.patch(
        f"/applications/{application_id}/status",
        json={"status": status.value},
    )


def transition_to_review(client: TestClient, application_id: str) -> None:
    for status in (
        ApplicationStatus.DOCUMENTS_PENDING,
        ApplicationStatus.PROCESSING,
        ApplicationStatus.VALIDATION,
        ApplicationStatus.REVIEW,
    ):
        response = transition_application(client, application_id, status)
        assert response.status_code == 200


def test_root(client):
    assert client.get("/").json() == {"message": "BestBank API is running"}


def test_get_existing_customer(client):
    customer_id = create_customer(client)

    response = client.get(f"/customers/{customer_id}")

    assert response.status_code == 200
    assert response.json()["customer_id"] == customer_id
    assert response.json()["name"] == "Test Customer"


def test_get_missing_customer(client):
    customer_id = str(uuid.uuid4())

    response = client.get(f"/customers/{customer_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Customer not found"}


def test_get_customer_with_invalid_uuid(client):
    response = client.get("/customers/not-a-uuid")

    assert response.status_code == 422


def test_get_existing_application(client):
    customer_id = create_customer(client)
    application_id = create_application(client, customer_id)

    response = client.get(f"/applications/{application_id}")

    assert response.status_code == 200
    assert response.json()["application_id"] == application_id
    assert response.json()["customer_id"] == customer_id
    assert response.json()["loan_type"] == "Personal Loan"
    assert response.json()["loan_amount"] == "50000.00"


def test_get_missing_application(client):
    application_id = str(uuid.uuid4())

    response = client.get(f"/applications/{application_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Loan application not found"}


def test_get_application_with_invalid_uuid(client):
    response = client.get("/applications/not-a-uuid")

    assert response.status_code == 422


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


def test_update_application_status_created_to_documents_pending(client):
    application_id = create_application(client, create_customer(client))

    response = transition_application(
        client,
        application_id,
        ApplicationStatus.DOCUMENTS_PENDING,
    )

    assert response.status_code == 200
    assert response.json()["status"] == ApplicationStatus.DOCUMENTS_PENDING.value


def test_update_application_status_review_to_approved(client):
    application_id = create_application(client, create_customer(client))
    transition_to_review(client, application_id)

    response = transition_application(
        client,
        application_id,
        ApplicationStatus.APPROVED,
    )

    assert response.status_code == 200
    assert response.json()["status"] == ApplicationStatus.APPROVED.value


def test_update_application_status_review_to_rejected(client):
    application_id = create_application(client, create_customer(client))
    transition_to_review(client, application_id)

    response = transition_application(
        client,
        application_id,
        ApplicationStatus.REJECTED,
    )

    assert response.status_code == 200
    assert response.json()["status"] == ApplicationStatus.REJECTED.value


def test_update_application_status_rejects_invalid_transition(client):
    application_id = create_application(client, create_customer(client))

    response = transition_application(
        client,
        application_id,
        ApplicationStatus.APPROVED,
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": (
            "Cannot transition application status from CREATED to APPROVED"
        )
    }


def test_update_application_status_rejects_transition_from_terminal_state(client):
    application_id = create_application(client, create_customer(client))
    transition_to_review(client, application_id)
    approved = transition_application(
        client,
        application_id,
        ApplicationStatus.APPROVED,
    )
    assert approved.status_code == 200

    response = transition_application(
        client,
        application_id,
        ApplicationStatus.REJECTED,
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": (
            "Cannot transition application status from APPROVED to REJECTED"
        )
    }


def test_update_missing_application_status_returns_404(client):
    response = transition_application(
        client,
        str(uuid.uuid4()),
        ApplicationStatus.DOCUMENTS_PENDING,
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Loan application not found"}


def test_update_application_status_rejects_invalid_uuid(client):
    response = client.patch(
        "/applications/not-a-uuid/status",
        json={"status": ApplicationStatus.DOCUMENTS_PENDING.value},
    )

    assert response.status_code == 422


def test_update_application_status_rejects_invalid_status_value(client):
    application_id = create_application(client, create_customer(client))

    response = client.patch(
        f"/applications/{application_id}/status",
        json={"status": "NOT_A_STATUS"},
    )

    assert response.status_code == 422


def test_update_application_status_is_persisted(client, db_session):
    application_id = create_application(client, create_customer(client))

    response = transition_application(
        client,
        application_id,
        ApplicationStatus.DOCUMENTS_PENDING,
    )

    assert response.status_code == 200
    db_session.expire_all()
    persisted = db_session.get(LoanApplication, uuid.UUID(application_id))
    assert persisted is not None
    assert persisted.status == ApplicationStatus.DOCUMENTS_PENDING


def test_decimal_has_two_places():
    assert Decimal("50000.50").quantize(Decimal("0.01")) == Decimal("50000.50")


def test_create_customer_rejects_invalid_email(client):
    response = client.post(
        "/customers",
        json={
            "name": "Test Customer",
            "email": "invalid-email",
            "phone": "9876543210",
        },
    )

    assert response.status_code == 422


def test_create_customer_rejects_duplicate_email(client):
    email = f"{uuid.uuid4()}@example.com"

    first_response = client.post(
        "/customers",
        json={
            "name": "First Customer",
            "email": email,
            "phone": "9876543210",
        },
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/customers",
        json={
            "name": "Second Customer",
            "email": email,
            "phone": "9876543211",
        },
    )

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == (
        "Customer with this email already exists"
    )


def test_database_operation_error_returns_internal_server_error(
    client,
    monkeypatch,
):
    def fail_to_create_customer(db, customer):
        raise DatabaseOperationError("Database operation failed")

    monkeypatch.setattr(
        "app.main.CustomerService.create_customer",
        fail_to_create_customer,
    )

    response = client.post(
        "/customers",
        json={
            "name": "Test Customer",
            "email": f"{uuid.uuid4()}@example.com",
            "phone": "9876543210",
        },
    )

    assert response.status_code == 500
    assert response.json() == {"detail": "Database operation failed"}