"""add company plant separation

Revision ID: ab12cd34ef56
Revises: fe6aac62e522
Create Date: 2025-10-25 11:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ab12cd34ef56'
down_revision = 'fe6aac62e522'
branch_labels = None
depends_on = None


def upgrade():
    # Increase factory_id column size for all tables
    # PostgreSQL needs explicit type casting

    # Factories table
    op.alter_column('factories', 'factory_id',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.String(length=200),
               existing_nullable=False)

    op.add_column('factories', sa.Column('company_name', sa.String(length=100), nullable=True))
    op.add_column('factories', sa.Column('plant_name', sa.String(length=100), nullable=True))

    # Employees table
    op.alter_column('employees', 'factory_id',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.String(length=200),
               existing_nullable=True)

    op.add_column('employees', sa.Column('company_name', sa.String(length=100), nullable=True))
    op.add_column('employees', sa.Column('plant_name', sa.String(length=100), nullable=True))

    # Contract workers table
    op.alter_column('contract_workers', 'factory_id',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.String(length=200),
               existing_nullable=True)

    op.add_column('contract_workers', sa.Column('company_name', sa.String(length=100), nullable=True))
    op.add_column('contract_workers', sa.Column('plant_name', sa.String(length=100), nullable=True))

    # Update existing data: Split factory_id into company_name and plant_name
    # Format expected: Company_Plant or Company__Plant
    op.execute("""
        UPDATE factories
        SET
            company_name = split_part(factory_id, '_', 1),
            plant_name = CASE
                WHEN factory_id LIKE '%__%' THEN split_part(factory_id, '__', 2)
                WHEN factory_id LIKE '%_%' THEN split_part(factory_id, '_', 2)
                ELSE ''
            END
        WHERE factory_id IS NOT NULL
    """)

    op.execute("""
        UPDATE employees
        SET
            company_name = split_part(factory_id, '_', 1),
            plant_name = CASE
                WHEN factory_id LIKE '%__%' THEN split_part(factory_id, '__', 2)
                WHEN factory_id LIKE '%_%' THEN split_part(factory_id, '_', 2)
                ELSE ''
            END
        WHERE factory_id IS NOT NULL
    """)

    op.execute("""
        UPDATE contract_workers
        SET
            company_name = split_part(factory_id, '_', 1),
            plant_name = CASE
                WHEN factory_id LIKE '%__%' THEN split_part(factory_id, '__', 2)
                WHEN factory_id LIKE '%_%' THEN split_part(factory_id, '_', 2)
                ELSE ''
            END
        WHERE factory_id IS NOT NULL
    """)


def downgrade():
    # Remove new columns
    op.drop_column('contract_workers', 'plant_name')
    op.drop_column('contract_workers', 'company_name')
    op.drop_column('employees', 'plant_name')
    op.drop_column('employees', 'company_name')
    op.drop_column('factories', 'plant_name')
    op.drop_column('factories', 'company_name')

    # Restore factory_id column size
    op.alter_column('contract_workers', 'factory_id',
               existing_type=sa.VARCHAR(length=200),
               type_=sa.String(length=20),
               existing_nullable=True)

    op.alter_column('employees', 'factory_id',
               existing_type=sa.VARCHAR(length=200),
               type_=sa.String(length=20),
               existing_nullable=True)

    op.alter_column('factories', 'factory_id',
               existing_type=sa.VARCHAR(length=200),
               type_=sa.String(length=20),
               existing_nullable=False)
