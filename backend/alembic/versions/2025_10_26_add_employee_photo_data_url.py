"""Add photo_data_url column to employees table

Revision ID: 2025_10_26_001
Revises:
Create Date: 2025-10-26 13:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2025_10_26_add_employee_photo_data_url'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add photo_data_url column to employees table if it doesn't exist
    try:
        op.add_column('employees', sa.Column('photo_data_url', sa.Text(), nullable=True))
    except Exception:
        # Column might already exist, which is fine
        pass


def downgrade() -> None:
    # Drop photo_data_url column if it exists
    try:
        op.drop_column('employees', 'photo_data_url')
    except Exception:
        # Column might not exist, which is fine
        pass
