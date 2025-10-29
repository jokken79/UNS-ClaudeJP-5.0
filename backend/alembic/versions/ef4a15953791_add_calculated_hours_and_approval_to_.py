"""add_calculated_hours_and_approval_to_timer_cards

Revision ID: ef4a15953791
Revises: e8f3b9c41a2e
Create Date: 2025-10-23 01:19:23.905106

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ef4a15953791'
down_revision: Union[str, None] = 'e8f3b9c41a2e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add calculated hours columns to timer_cards
    op.add_column('timer_cards', sa.Column('regular_hours', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False))
    op.add_column('timer_cards', sa.Column('overtime_hours', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False))
    op.add_column('timer_cards', sa.Column('night_hours', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False))
    op.add_column('timer_cards', sa.Column('holiday_hours', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False))

    # Add approval flag
    op.add_column('timer_cards', sa.Column('is_approved', sa.Boolean(), server_default='false', nullable=False))

    # Add employee_id and factory_id for easier querying
    op.add_column('timer_cards', sa.Column('employee_id', sa.Integer(), nullable=True))
    op.add_column('timer_cards', sa.Column('factory_id', sa.String(length=20), nullable=True))


def downgrade() -> None:
    # Remove added columns
    op.drop_column('timer_cards', 'factory_id')
    op.drop_column('timer_cards', 'employee_id')
    op.drop_column('timer_cards', 'is_approved')
    op.drop_column('timer_cards', 'holiday_hours')
    op.drop_column('timer_cards', 'night_hours')
    op.drop_column('timer_cards', 'overtime_hours')
    op.drop_column('timer_cards', 'regular_hours')
