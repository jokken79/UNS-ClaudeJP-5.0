"""add unique constraints for data integrity

Revision ID: 2025_10_27_002
Revises: 2025_10_27_001
Create Date: 2025-10-27

This migration adds UNIQUE constraints to prevent duplicate data entries.
These constraints ensure data integrity and prevent common data quality issues.

Estimated execution time: 2-3 minutes
Impact: Prevents duplicate records, improves data quality
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2025_10_27_002'
down_revision = '2025_10_27_001'
branch_labels = None
depends_on = None


def upgrade():
    """Add unique constraints to prevent duplicate data"""

    # Timer Cards - prevent duplicate entries for same employee on same date
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_timer_cards_unique_entry
        ON timer_cards(hakenmoto_id, work_date)
    """)

    # Salary Calculations - prevent duplicate calculations for same period
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_salary_unique_employee_period
        ON salary_calculations(employee_id, year, month)
    """)

    # Requests - prevent duplicate requests (except rejected ones)
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_unique_request
        ON requests(hakenmoto_id, request_type, start_date, end_date)
        WHERE status != 'rejected'
    """)

    # Candidates - prevent duplicate persons (same name + DOB)
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_unique_person
        ON candidates(full_name_kanji, date_of_birth)
        WHERE status != 'rejected'
    """)

    # Candidates - prevent duplicate applicant IDs
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_unique_applicant
        ON candidates(applicant_id)
        WHERE applicant_id IS NOT NULL
    """)

    # Factories - prevent duplicate company+plant combinations
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_factories_unique_company_plant
        ON factories(company_name, plant_name)
    """)

    # Documents - prevent duplicate file uploads
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_unique_file
        ON documents(file_path)
    """)

    # Social Insurance Rates - prevent duplicate rate entries
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_insurance_rates_unique
        ON social_insurance_rates(standard_compensation, effective_date, prefecture)
    """)


def downgrade():
    """Remove unique constraints"""

    # Drop all unique indexes created in upgrade()
    op.drop_index('idx_timer_cards_unique_entry', table_name='timer_cards', if_exists=True)
    op.drop_index('idx_salary_unique_employee_period', table_name='salary_calculations', if_exists=True)
    op.drop_index('idx_requests_unique_request', table_name='requests', if_exists=True)
    op.drop_index('idx_candidates_unique_person', table_name='candidates', if_exists=True)
    op.drop_index('idx_candidates_unique_applicant', table_name='candidates', if_exists=True)
    op.drop_index('idx_factories_unique_company_plant', table_name='factories', if_exists=True)
    op.drop_index('idx_documents_unique_file', table_name='documents', if_exists=True)
    op.drop_index('idx_insurance_rates_unique', table_name='social_insurance_rates', if_exists=True)
