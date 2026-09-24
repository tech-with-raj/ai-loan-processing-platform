"""create initial BestBank schema

Revision ID: 20260924_initial
Revises:
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

revision: str = "20260924_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

application_status = postgresql.ENUM(
    "CREATED", "DOCUMENTS_PENDING", "PROCESSING", "VALIDATION",
    "REVIEW", "APPROVED", "REJECTED", name="application_status"
)


def upgrade() -> None:
    bind = op.get_bind()
    database_inspector = inspect(bind)
    application_status.create(bind, checkfirst=True)

    if not database_inspector.has_table("customers"):
        op.create_table(
            "customers",
            sa.Column("customer_id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("phone", sa.String(length=20), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True),
                      server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
            sa.UniqueConstraint("email", name="uq_customers_email"),
        )
    else:
        op.execute(sa.text(
            "UPDATE customers SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"
        ))
        op.alter_column("customers", "created_at",
                        existing_type=sa.DateTime(timezone=True),
                        server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False)

    if not database_inspector.has_table("loan_applications"):
        op.create_table(
            "loan_applications",
            sa.Column("application_id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("customer_id", postgresql.UUID(as_uuid=True),
                      sa.ForeignKey("customers.customer_id"), nullable=False),
            sa.Column("loan_type", sa.String(length=50), nullable=False),
            sa.Column("loan_amount", sa.Numeric(15, 2), nullable=False),
            sa.Column("status", application_status, server_default="CREATED", nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True),
                      server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        )
    else:
        op.execute(sa.text(
            "UPDATE loan_applications SET created_at = CURRENT_TIMESTAMP "
            "WHERE created_at IS NULL"
        ))
        op.execute(sa.text(
            "UPDATE loan_applications SET status = 'VALIDATION' "
            "WHERE status = 'UNDER_REVIEW'"
        ))
        op.execute(sa.text(
            "UPDATE loan_applications SET status = 'REVIEW' "
            "WHERE status = 'REQUIRES_REVIEW'"
        ))
        op.execute(sa.text(
            "ALTER TABLE loan_applications ALTER COLUMN status DROP DEFAULT"
        ))
        op.execute(sa.text(
            "ALTER TABLE loan_applications ALTER COLUMN status TYPE application_status "
            "USING status::text::application_status"
        ))
        op.alter_column("loan_applications", "status",
                        server_default="CREATED", nullable=False)
        op.alter_column("loan_applications", "created_at",
                        existing_type=sa.DateTime(timezone=True),
                        server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False)


def downgrade() -> None:
    op.drop_table("loan_applications")
    op.drop_table("customers")
    application_status.drop(op.get_bind())