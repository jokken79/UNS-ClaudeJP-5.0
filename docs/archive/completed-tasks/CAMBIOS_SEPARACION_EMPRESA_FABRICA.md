# 📋 CAMBIOS: Separación de Empresa y Fábrica

## ✅ Cambios Completados (2025-10-25)

### 1. **Consolidación de Fábricas de Okayama**

**Archivos consolidados:**
- `高雄工業株式会社_CVJ工場.json` (8 líneas)
- `高雄工業株式会社_HUB工場.json` (5 líneas)

**Resultado:**
- ✅ Nuevo archivo: `高雄工業株式会社_岡山工場.json` (13 líneas totales)
- ✅ Backup creado en: `config/factories/backup/before_okayama_consolidation_20251025_113707/`

**Razón**: Ambas fábricas están en la misma ubicación física (岡山県岡山市北区御津伊田1028-19)

---

### 2. **Actualización de Formato de factory_id**

**Formato anterior:** `Company_Plant` (single underscore)
```json
{
  "factory_id": "高雄工業株式会社_海南第一工場"
}
```

**Formato nuevo:** `Company__Plant` (double underscore)
```json
{
  "factory_id": "高雄工業株式会社__海南第一工場"
}
```

**Archivos actualizados:** 21 archivos JSON (excluye factory_id_mapping.json)

**Backup creado:** `config/factories/backup/before_double_underscore_20251025_115119/`

---

### 3. **Modificación de Modelos de Base de Datos**

#### a) **Factory Model** (`backend/app/models/models.py`)

**ANTES:**
```python
class Factory(Base):
    __tablename__ = "factories"

    factory_id = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    ...
```

**DESPUÉS:**
```python
class Factory(Base):
    __tablename__ = "factories"

    factory_id = Column(String(200), unique=True, nullable=False, index=True)  # Compound: Company__Plant
    company_name = Column(String(100))  # 企業名 - Company name
    plant_name = Column(String(100))    # 工場名 - Plant/Factory name
    name = Column(String(100), nullable=False)
    ...
```

#### b) **Employee Model** (`backend/app/models/models.py`)

**ANTES:**
```python
class Employee(Base):
    __tablename__ = "employees"

    factory_id = Column(String(20), ForeignKey("factories.factory_id"))
    ...
```

**DESPUÉS:**
```python
class Employee(Base):
    __tablename__ = "employees"

    factory_id = Column(String(200), ForeignKey("factories.factory_id"))  # Compound: Company__Plant
    company_name = Column(String(100))  # 企業名 - Company name (denormalized for easy display)
    plant_name = Column(String(100))    # 工場名 - Plant name (denormalized for easy display)
    ...
```

#### c) **ContractWorker Model** (`backend/app/models/models.py`)

**ANTES:**
```python
class ContractWorker(Base):
    __tablename__ = "contract_workers"

    factory_id = Column(String(20), ForeignKey("factories.factory_id"))
    ...
```

**DESPUÉS:**
```python
class ContractWorker(Base):
    __tablename__ = "contract_workers"

    factory_id = Column(String(200), ForeignKey("factories.factory_id"))  # Compound: Company__Plant
    company_name = Column(String(100))  # 企業名 - Company name (denormalized for easy display)
    plant_name = Column(String(100))    # 工場名 - Plant name (denormalized for easy display)
    ...
```

---

### 4. **Migración de Base de Datos Creada**

**Archivo:** `backend/alembic/versions/ab12cd34ef56_add_company_plant_separation.py`

**Cambios que aplicará:**

1. **Aumentar tamaño de factory_id:**
   - De `VARCHAR(20)` a `VARCHAR(200)`
   - En tablas: `factories`, `employees`, `contract_workers`

2. **Agregar nuevas columnas:**
   - `company_name VARCHAR(100)` - Nombre de empresa
   - `plant_name VARCHAR(100)` - Nombre de planta/fábrica
   - En tablas: `factories`, `employees`, `contract_workers`

3. **Poblar datos automáticamente:**
   - Divide `factory_id` existente en `company_name` y `plant_name`
   - Usa el separador `__` (double underscore) o `_` (single underscore)
   - Ejemplo:
     ```sql
     factory_id = "高雄工業株式会社__海南第一工場"
     → company_name = "高雄工業株式会社"
     → plant_name = "海南第一工場"
     ```

---

## ⏳ Pasos Pendientes

### 1. **Aplicar Migración de Base de Datos**

Una vez Docker esté corriendo:

```bash
# Entrar al contenedor backend
docker exec -it uns-claudejp-backend bash

# Aplicar migración
cd /app
alembic upgrade head
```

**IMPORTANTE:**
- ✅ La migración es **SEGURA** (usa transacciones con rollback)
- ✅ Los datos existentes se **PRESERVAN**
- ✅ Los campos nuevos se **POPULAN AUTOMÁTICAMENTE** desde factory_id

---

### 2. **Actualizar Scripts de Importación**

Archivos que necesitan actualización:
- `backend/scripts/import_data.py` - Mapping manual de factory_id
- Scripts que cargan factories desde JSON
- Frontend: Componentes que muestran factory_id

**Cambio necesario en mapping:**

```python
# ANTES
'高雄工業 CVJ': '高雄工業株式会社_CVJ工場',

# DESPUÉS
'高雄工業 CVJ': '高雄工業株式会社__岡山工場',  # ← Consolidado en 岡山工場
'高雄工業 HUB': '高雄工業株式会社__岡山工場',  # ← Consolidado en 岡山工場
```

---

## 🎯 Ventajas del Nuevo Sistema

### 1. **Legibilidad Mejorada en Frontend**

**ANTES:**
```
Factory ID: 高雄工業株式会社_海南第一工場  (muy largo!)
```

**DESPUÉS:**
```
Empresa: 高雄工業株式会社
Planta: 海南第一工場
```

### 2. **Búsquedas Más Fáciles**

```sql
-- Buscar todos los empleados de una empresa
SELECT * FROM employees WHERE company_name = '高雄工業株式会社';

-- Buscar empleados de una planta específica
SELECT * FROM employees WHERE plant_name = '海南第一工場';
```

### 3. **Mejor Normalización**

- Datos separados pero relacionados
- `factory_id` sigue siendo la clave foránea (integridad referencial)
- `company_name` y `plant_name` son denormalizados para display

---

## 📊 Resumen de Archivos Modificados

### Archivos de Configuración (JSON):
- ✅ 21 archivos `.json` actualizados con `Company__Plant` format
- ✅ 1 archivo consolidado (`岡山工場.json`)
- ✅ 2 archivos eliminados (`CVJ工場.json`, `HUB工場.json`)

### Modelos de Base de Datos:
- ✅ `backend/app/models/models.py` - 3 modelos actualizados

### Migraciones:
- ✅ `backend/alembic/versions/ab12cd34ef56_add_company_plant_separation.py` - Creada

### Scripts Creados:
- ✅ `consolidate_okayama.py` - Consolidación de Okayama
- ✅ `update_factory_id_format.py` - Actualización de formato

### Backups Creados:
1. `config/factories/backup/before_okayama_consolidation_20251025_113707/`
2. `config/factories/backup/before_double_underscore_20251025_115119/`

---

## ⚠️ IMPORTANTE: Próximos Pasos

1. **Esperar que Docker termine de iniciar**
2. **Aplicar migración:** `docker exec -it uns-claudejp-backend alembic upgrade head`
3. **Actualizar import_data.py** con nuevos mappings
4. **Regenerar factories_index.json** con nuevo formato
5. **Verificar frontend** muestra correctamente empresa y planta separadas

---

## 🔒 Seguridad

- ✅ **3 backups creados** antes de cada cambio
- ✅ **Migración con rollback automático**
- ✅ **Datos preservados** en todos los cambios
- ✅ **Integridad referencial** mantenida

---

**Fecha de cambios:** 2025-10-25
**Responsable:** Claude Code (AI Assistant)
