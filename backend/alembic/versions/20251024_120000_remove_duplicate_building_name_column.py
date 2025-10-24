"""remove duplicate building_name column

Revision ID: 3c7e9f2b8a4d
Revises: d49ae3cbfac6
Create Date: 2025-10-24 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3c7e9f2b8a4d'
down_revision = 'd49ae3cbfac6'
branch_labels = None
depends_on = None


def upgrade():
    """Remove duplicate building_name column from candidates table.

    This column was redundant with address_building which contains the same data.
    All references have been updated to use address_building instead.
    """
    # Drop the duplicate column
    op.drop_column('candidates', 'building_name')


def downgrade():
    """Restore building_name column if needed for rollback."""
    # Add the column back as nullable
    op.add_column('candidates', sa.Column('building_name', sa.String(length=100), nullable=True))
