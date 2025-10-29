"""add employee excel fields

Revision ID: e8f3b9c41a2e
Revises: 3c20e838905b
Create Date: 2025-10-19 04:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e8f3b9c41a2e'
down_revision = '3c20e838905b'
branch_labels = None
depends_on = None


def upgrade():
    # Agregar nuevas columnas a employees
    op.add_column('employees', sa.Column('current_status', sa.String(length=20), nullable=True, server_default='active'))
    op.add_column('employees', sa.Column('visa_renewal_alert', sa.Boolean(), nullable=True, server_default=sa.false()))
    op.add_column('employees', sa.Column('visa_alert_days', sa.Integer(), nullable=True, server_default='30'))

    # Crear índice para current_status
    op.create_index('idx_employees_current_status', 'employees', ['current_status'])

    # Crear índice parcial para visa_renewal_alert (solo TRUE)
    op.execute("""
        CREATE INDEX idx_employees_visa_alert_true
        ON employees(visa_renewal_alert)
        WHERE visa_renewal_alert = TRUE
    """)

    # Sincronizar datos existentes
    op.execute("""
        UPDATE employees
        SET current_status = CASE
            WHEN is_active = TRUE THEN 'active'
            WHEN termination_date IS NOT NULL THEN 'terminated'
            ELSE 'active'
        END
    """)

    # Crear función para sincronizar status
    op.execute("""
        CREATE OR REPLACE FUNCTION sync_employee_status()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Si se marca como terminated, actualizar is_active
            IF NEW.current_status = 'terminated' AND NEW.termination_date IS NOT NULL THEN
                NEW.is_active = FALSE;
            END IF;

            -- Si se marca como active, asegurar que is_active sea TRUE
            IF NEW.current_status = 'active' THEN
                NEW.is_active = TRUE;
                NEW.termination_date = NULL;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Crear trigger para sincronizar status
    op.execute("""
        CREATE TRIGGER employee_status_sync
            BEFORE INSERT OR UPDATE ON employees
            FOR EACH ROW
            EXECUTE FUNCTION sync_employee_status();
    """)

    # Crear función para verificar expiración de visa
    op.execute("""
        CREATE OR REPLACE FUNCTION check_visa_expiration()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Actualizar alerta si la visa expira en los próximos N días
            IF NEW.zairyu_expire_date IS NOT NULL AND NEW.visa_alert_days IS NOT NULL THEN
                IF NEW.zairyu_expire_date - CURRENT_DATE <= NEW.visa_alert_days THEN
                    NEW.visa_renewal_alert = TRUE;
                ELSE
                    NEW.visa_renewal_alert = FALSE;
                END IF;
            ELSE
                NEW.visa_renewal_alert = FALSE;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Crear trigger para verificar visa
    op.execute("""
        CREATE TRIGGER visa_expiration_check
            BEFORE INSERT OR UPDATE ON employees
            FOR EACH ROW
            EXECUTE FUNCTION check_visa_expiration();
    """)

    # Actualizar alertas de visa para empleados existentes
    op.execute("""
        UPDATE employees
        SET visa_renewal_alert = CASE
            WHEN zairyu_expire_date IS NOT NULL
                 AND zairyu_expire_date - CURRENT_DATE <= visa_alert_days THEN TRUE
            ELSE FALSE
        END
    """)

    # Crear vista útil con edad calculada
    op.execute("""
        CREATE OR REPLACE VIEW vw_employees_with_age AS
        SELECT
            e.*,
            EXTRACT(YEAR FROM AGE(e.date_of_birth)) AS calculated_age,
            CASE
                WHEN e.zairyu_expire_date - CURRENT_DATE <= e.visa_alert_days THEN TRUE
                ELSE FALSE
            END AS visa_expiring_soon,
            e.zairyu_expire_date - CURRENT_DATE AS days_until_visa_expiration,
            f.name AS factory_name
        FROM employees e
        LEFT JOIN factories f ON e.factory_id = f.factory_id;
    """)

    print("✅ Migración completada:")
    print("  - Agregadas columnas: current_status, visa_renewal_alert, visa_alert_days")
    print("  - Creados índices para current_status y visa_renewal_alert")
    print("  - Creados triggers para sincronización automática")
    print("  - Creada vista vw_employees_with_age")


def downgrade():
    # Eliminar vista
    op.execute("DROP VIEW IF EXISTS vw_employees_with_age")

    # Eliminar triggers
    op.execute("DROP TRIGGER IF EXISTS visa_expiration_check ON employees")
    op.execute("DROP TRIGGER IF EXISTS employee_status_sync ON employees")

    # Eliminar funciones
    op.execute("DROP FUNCTION IF EXISTS check_visa_expiration()")
    op.execute("DROP FUNCTION IF EXISTS sync_employee_status()")

    # Eliminar índices
    op.execute("DROP INDEX IF EXISTS idx_employees_visa_alert_true")
    op.drop_index('idx_employees_current_status', table_name='employees')

    # Eliminar columnas
    op.drop_column('employees', 'visa_alert_days')
    op.drop_column('employees', 'visa_renewal_alert')
    op.drop_column('employees', 'current_status')

    print("✅ Rollback completado - columnas y triggers eliminados")
