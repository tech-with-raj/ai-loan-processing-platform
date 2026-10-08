from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.exceptions import (
    CustomerNotFoundError,
    DatabaseOperationError,
    DuplicateCustomerError,
    ApplicationNotFoundError,
    InvalidApplicationStatusTransitionError,
)


async def handle_customer_not_found(
    request: Request,
    exc: CustomerNotFoundError,
):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )


async def handle_duplicate_customer(
    request: Request,
    exc: DuplicateCustomerError,
):
    return JSONResponse(
        status_code=409,
        content={"detail": str(exc)},
    )


async def handle_database_operation(
    request: Request,
    exc: DatabaseOperationError,
):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

async def handle_application_not_found(
    request: Request,
    exc: ApplicationNotFoundError,
):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )


async def handle_invalid_application_status_transition(
    request: Request,
    exc: InvalidApplicationStatusTransitionError,
):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(
        CustomerNotFoundError,
        handle_customer_not_found,
    )
    app.add_exception_handler(
        DuplicateCustomerError,
        handle_duplicate_customer,
    )
    app.add_exception_handler(
        DatabaseOperationError,
        handle_database_operation,
    )
    app.add_exception_handler(
        ApplicationNotFoundError,
        handle_application_not_found,
    )
    app.add_exception_handler(
        InvalidApplicationStatusTransitionError,
        handle_invalid_application_status_transition,
    )
