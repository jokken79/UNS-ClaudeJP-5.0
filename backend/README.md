# Backend FastAPI - UNS-ClaudeJP 4.2

## 🚀 Requisitos
- Python 3.11+
- pip / uv
- PostgreSQL 15 (cuando se ejecuta fuera de Docker)

## ▶️ Ejecución local (sin Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://USER:PASS@localhost:5432/uns_claudejp
uvicorn app.main:app --reload
```

## ▶️ Ejecución en Docker

Los servicios se levantan automáticamente con `docker compose up -d`. Para acceder al contenedor:

```bash
docker exec -it uns-claudejp-backend bash
```

## 🧪 Pruebas

```bash
pytest backend/tests
```

El test `test_health.py` verifica el endpoint `/api/health`. Añade pruebas adicionales en `backend/tests/`.

## 🗃️ Migraciones

### Aplicar migraciones

```bash
# Dentro del contenedor
docker exec -it uns-claudejp-backend bash
cd /app

# Aplicar todas las migraciones pendientes
alembic upgrade head

# Ver estado actual
alembic current

# Ver historial
alembic history
```

### Crear nueva migración

```bash
# Auto-generar migración basada en cambios en models.py
alembic revision --autogenerate -m "describe change"

# Crear migración manual vacía
alembic revision -m "describe change"
```

### Migraciones SQL de Performance (2025-10-27)

Se han agregado **7 migraciones críticas** para mejorar performance e integridad:

```bash
# Acceder al contenedor
docker exec -it uns-claudejp-backend bash
cd /app

# 1. Aplicar TODAS las migraciones SQL (30-40 minutos)
alembic upgrade head

# 2. Crear vista de empleados con edad
python scripts/create_employee_view.py

# 3. Verificar que todo se aplicó correctamente
python scripts/verify_migrations.py
```

**Beneficios esperados**:
- 🚀 80-90% mejora en performance de queries
- 🔒 Prevención de duplicados con UNIQUE constraints
- 🔍 Búsquedas de texto 100x más rápidas (full-text search)
- ⚡ Queries JSON 50-70% más rápidas (JSONB)
- 🤖 Status y alertas de visa automáticas con triggers

Ver documentación completa en: [`/docs/02-configuracion/MIGRACIONES_SQL_2025-10-27.md`](../docs/02-configuracion/MIGRACIONES_SQL_2025-10-27.md)

### Rollback de migraciones

```bash
# Rollback una migración
alembic downgrade -1

# Rollback a migración específica
alembic downgrade <revision_id>

# Ver SQL sin ejecutar (dry run)
alembic upgrade head --sql > preview.sql
```

Consulta [base-datos/README_MIGRACION.md](../base-datos/README_MIGRACION.md) para instrucciones detalladas.

## 🔐 Variables importantes (`.env`)
- `DATABASE_URL`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `FRONTEND_URL`
- `MAX_UPLOAD_SIZE`

Revisa [docs/reports/2024-11-Backend-Hardening.md](../docs/reports/2024-11-Backend-Hardening.md) para mejores prácticas de seguridad.

---

**Última actualización:** 2025-10-27 (Added SQL performance migrations)
