"""make customer timestamps timezone-aware

Revision ID: 20260924_customer_tz
Revises: 20260924_initial
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260924_customer_tz"
down_revision: Union[str, None] = "20260924_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "customers",
        "created_at",
        existing_type=sa.DateTime(timezone=False),
        type_=sa.DateTime(timezone=True),
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    op.alter_column(
        "customers",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(timezone=False),
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )