"""add_missing_candidate_columns_simple

Revision ID: fe6aac62e522
Revises: ef4a15953791
Create Date: 2025-10-24 00:26:15.994355

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fe6aac62e522'
down_revision: Union[str, None] = 'ef4a15953791'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add missing columns to candidates table
    op.add_column('candidates', sa.Column('photo_data_url', sa.Text(), nullable=True))
    op.add_column('candidates', sa.Column('lunch_preference', sa.String(length=50), nullable=True))
    op.add_column('candidates', sa.Column('glasses', sa.String(length=100), nullable=True))
    op.add_column('candidates', sa.Column('ocr_notes', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove the columns if rolling back
    op.drop_column('candidates', 'ocr_notes')
    op.drop_column('candidates', 'glasses')
    op.drop_column('candidates', 'lunch_preference')
    op.drop_column('candidates', 'photo_data_url')
