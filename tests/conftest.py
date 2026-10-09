import pytest
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.database import engine


@pytest.fixture()
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()