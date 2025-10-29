"""add performance indexes

Revision ID: 2025_10_26_003
Revises: 2025_10_26_add_employee_photo_data_url
Create Date: 2025-10-26

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2025_10_26_003'
down_revision = '2025_10_26_add_employee_photo_data_url'
branch_labels = None
depends_on = None


def upgrade():
    """Add performance indexes for frequently queried columns"""

    # Candidates table indexes
    op.create_index('idx_candidates_full_name_kanji', 'candidates', ['full_name_kanji'])
    op.create_index('idx_candidates_full_name_kana', 'candidates', ['full_name_kana'])
    op.create_index('idx_candidates_full_name_roman', 'candidates', ['full_name_roman'])
    op.create_index('idx_candidates_rirekisho_id', 'candidates', ['rirekisho_id'])
    op.create_index('idx_candidates_applicant_id', 'candidates', ['applicant_id'])
    op.create_index('idx_candidates_status', 'candidates', ['status'])
    op.create_index('idx_candidates_created_at', 'candidates', ['created_at'])

    # Employees table indexes
    op.create_index('idx_employees_hakenmoto_id', 'employees', ['hakenmoto_id'])
    op.create_index('idx_employees_hakensaki_shain_id', 'employees', ['hakensaki_shain_id'])
    op.create_index('idx_employees_factory_id', 'employees', ['factory_id'])
    op.create_index('idx_employees_rirekisho_id', 'employees', ['rirekisho_id'])
    op.create_index('idx_employees_full_name_kanji', 'employees', ['full_name_kanji'])
    op.create_index('idx_employees_full_name_kana', 'employees', ['full_name_kana'])
    op.create_index('idx_employees_is_active', 'employees', ['is_active'])
    op.create_index('idx_employees_hire_date', 'employees', ['hire_date'])

    # Timer cards table indexes
    op.create_index('idx_timer_cards_employee_id', 'timer_cards', ['employee_id'])
    op.create_index('idx_timer_cards_work_date', 'timer_cards', ['work_date'])
    op.create_index('idx_timer_cards_is_approved', 'timer_cards', ['is_approved'])
    # Composite index for common query pattern (employee + date range)
    op.create_index('idx_timer_cards_employee_date', 'timer_cards', ['employee_id', 'work_date'])

    # Salary calculations table indexes
    op.create_index('idx_salary_employee_id', 'salary_calculations', ['employee_id'])
    op.create_index('idx_salary_month', 'salary_calculations', ['month'])
    op.create_index('idx_salary_year', 'salary_calculations', ['year'])
    op.create_index('idx_salary_is_paid', 'salary_calculations', ['is_paid'])
    # Composite index for common query pattern (employee + month/year)
    op.create_index('idx_salary_employee_month_year', 'salary_calculations', ['employee_id', 'year', 'month'])

    # Requests table indexes
    op.create_index('idx_requests_hakenmoto_id', 'requests', ['hakenmoto_id'])
    op.create_index('idx_requests_status', 'requests', ['status'])
    op.create_index('idx_requests_request_type', 'requests', ['request_type'])
    op.create_index('idx_requests_start_date', 'requests', ['start_date'])
    # Composite index for common query pattern (employee + status)
    op.create_index('idx_requests_hakenmoto_status', 'requests', ['hakenmoto_id', 'status'])

    # Factories table indexes
    op.create_index('idx_factories_factory_id', 'factories', ['factory_id'])
    op.create_index('idx_factories_name', 'factories', ['name'])
    op.create_index('idx_factories_is_active', 'factories', ['is_active'])

    # Documents table indexes
    op.create_index('idx_documents_candidate_id', 'documents', ['candidate_id'])
    op.create_index('idx_documents_employee_id', 'documents', ['employee_id'])
    op.create_index('idx_documents_document_type', 'documents', ['document_type'])

    # Users table indexes
    op.create_index('idx_users_username', 'users', ['username'])
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_role', 'users', ['role'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])


def downgrade():
    """Remove performance indexes"""

    # Candidates table indexes
    op.drop_index('idx_candidates_full_name_kanji', table_name='candidates')
    op.drop_index('idx_candidates_full_name_kana', table_name='candidates')
    op.drop_index('idx_candidates_full_name_roman', table_name='candidates')
    op.drop_index('idx_candidates_rirekisho_id', table_name='candidates')
    op.drop_index('idx_candidates_applicant_id', table_name='candidates')
    op.drop_index('idx_candidates_status', table_name='candidates')
    op.drop_index('idx_candidates_created_at', table_name='candidates')

    # Employees table indexes
    op.drop_index('idx_employees_hakenmoto_id', table_name='employees')
    op.drop_index('idx_employees_hakensaki_shain_id', table_name='employees')
    op.drop_index('idx_employees_factory_id', table_name='employees')
    op.drop_index('idx_employees_rirekisho_id', table_name='employees')
    op.drop_index('idx_employees_full_name_kanji', table_name='employees')
    op.drop_index('idx_employees_full_name_kana', table_name='employees')
    op.drop_index('idx_employees_is_active', table_name='employees')
    op.drop_index('idx_employees_hire_date', table_name='employees')

    # Timer cards table indexes
    op.drop_index('idx_timer_cards_employee_id', table_name='timer_cards')
    op.drop_index('idx_timer_cards_work_date', table_name='timer_cards')
    op.drop_index('idx_timer_cards_is_approved', table_name='timer_cards')
    op.drop_index('idx_timer_cards_employee_date', table_name='timer_cards')

    # Salary calculations table indexes
    op.drop_index('idx_salary_employee_id', table_name='salary_calculations')
    op.drop_index('idx_salary_month', table_name='salary_calculations')
    op.drop_index('idx_salary_year', table_name='salary_calculations')
    op.drop_index('idx_salary_is_paid', table_name='salary_calculations')
    op.drop_index('idx_salary_employee_month_year', table_name='salary_calculations')

    # Requests table indexes
    op.drop_index('idx_requests_hakenmoto_id', table_name='requests')
    op.drop_index('idx_requests_status', table_name='requests')
    op.drop_index('idx_requests_request_type', table_name='requests')
    op.drop_index('idx_requests_start_date', table_name='requests')
    op.drop_index('idx_requests_hakenmoto_status', table_name='requests')

    # Factories table indexes
    op.drop_index('idx_factories_factory_id', table_name='factories')
    op.drop_index('idx_factories_name', table_name='factories')
    op.drop_index('idx_factories_is_active', table_name='factories')

    # Documents table indexes
    op.drop_index('idx_documents_candidate_id', table_name='documents')
    op.drop_index('idx_documents_employee_id', table_name='documents')
    op.drop_index('idx_documents_document_type', table_name='documents')

    # Users table indexes
    op.drop_index('idx_users_username', table_name='users')
    op.drop_index('idx_users_email', table_name='users')
    op.drop_index('idx_users_role', table_name='users')
    op.drop_index('idx_users_is_active', table_name='users')
