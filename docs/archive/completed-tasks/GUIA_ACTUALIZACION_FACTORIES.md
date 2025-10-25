# 📋 GUÍA: Actualización de Factory IDs

## ✅ Lo que YA se completó (archivos JSON):

- ✅ **22 archivos JSON renombrados** (sin prefijo `Factory-XX_`)
- ✅ **factory_id actualizado** dentro de cada JSON
- ✅ **Backup creado**: `config/factories/backup/before_rename_20251025_111109/`
- ✅ **Mapeo guardado**: `config/factories/factory_id_mapping.json`

## ⚠️ Lo que FALTA (base de datos):

Actualizar las referencias `factory_id` en 3 tablas:
- 📊 `factories` - Tabla de fábricas
- 👥 `employees` - Tabla de empleados
- 👷 `contract_workers` - Tabla de trabajadores por contrato

---

## 🔒 ¿Es SEGURO actualizar la base de datos?

### ✅ SÍ, es completamente seguro por estas razones:

1. **Transacciones con Rollback**
   - Si algo falla, TODOS los cambios se revierten automáticamente
   - Base de datos queda exactamente como estaba

2. **Mapeo Exacto**
   - Cada `Factory-01` → `瑞陵精機株式会社_恵那工場`
   - El script usa el archivo `factory_id_mapping.json`
   - No hay pérdida de datos

3. **Integridad Referencial**
   - Los empleados seguirán conectados a sus fábricas
   - Solo cambia el ID, la relación se mantiene

4. **Proceso Reversible**
   - Tienes backup de los archivos JSON originales
   - Puedes restaurar si es necesario

---

## 📝 PASOS A SEGUIR:

### Paso 1: Iniciar Docker

```bash
# Desde scripts\START.bat o manualmente:
docker compose up -d
```

### Paso 2: Verificar Referencias (Opcional)

```bash
python check_employee_factories.py
```

Este script te mostrará:
- ✅ Cuántos empleados tienen `factory_id`
- ✅ Cuántos contract workers tienen `factory_id`
- ✅ Ejemplos de factory_id que se actualizarán

### Paso 3: Actualizar Base de Datos

```bash
python update_factory_ids.py
```

**El script te pedirá confirmación antes de hacer cambios:**

```
⚠️  Esta operación actualizará:
   - Tabla 'factories'
   - Tabla 'employees'
   - Tabla 'contract_workers'

¿Deseas continuar? (SI/no):
```

### Paso 4: Verificar Resultado

El script mostrará algo como:

```
Actualizando: Factory-01 → 瑞陵精機株式会社_恵那工場
   Factories: 1, Employees: 5, Contract Workers: 0

Actualizando: Factory-14 → 加藤木材工業株式会社_本社工場
   Factories: 1, Employees: 12, Contract Workers: 2

...

✅ Base de datos actualizada exitosamente!
```

---

## 🎯 Ejemplo de lo que pasará:

### ANTES de `update_factory_ids.py`:

**Tabla `employees`:**
```sql
id  | hakenmoto_id | factory_id   | name
----|--------------|--------------|------
1   | 1001         | Factory-01   | 田中太郎
2   | 1002         | Factory-14   | 佐藤花子
```

**Problema:** ❌ Los archivos JSON ya no tienen `Factory-01`, ahora se llama `瑞陵精機株式会社_恵那工場`

### DESPUÉS de `update_factory_ids.py`:

**Tabla `employees`:**
```sql
id  | hakenmoto_id | factory_id                 | name
----|--------------|----------------------------|------
1   | 1001         | 瑞陵精機株式会社_恵那工場    | 田中太郎
2   | 1002         | 加藤木材工業株式会社_本社工場 | 佐藤花子
```

**Solución:** ✅ Los empleados ahora tienen referencias que coinciden con los archivos JSON

---

## ❓ Preguntas Frecuentes:

### ¿Perderé datos de empleados?
**NO.** Solo se actualiza el campo `factory_id`. Todos los demás datos (nombre, dirección, salario, etc.) permanecen intactos.

### ¿Se perderá la relación empleado-fábrica?
**NO.** La relación se mantiene, solo cambia el ID de la fábrica.

### ¿Qué pasa si hay un error?
El script usa transacciones con rollback automático. Si hay error, NADA cambia.

### ¿Puedo revertir los cambios?
Tienes backup de los archivos JSON. Para revertir la BD, necesitarías un backup de PostgreSQL (que deberías tener).

### ¿Afectará a los empleados que NO tienen factory_id?
**NO.** Solo se actualizan los registros que tienen `factory_id IS NOT NULL`.

---

## 🚨 IMPORTANTE:

**NO ejecutes `update_factory_ids.py` hasta:**
1. ✅ Tener Docker corriendo
2. ✅ Haber verificado con `check_employee_factories.py`
3. ✅ Estar seguro de que quieres hacer el cambio

---

## 📞 Si algo sale mal:

1. **Error durante la actualización:**
   - El rollback automático revertirá los cambios
   - Revisa el mensaje de error
   - Contacta soporte si es necesario

2. **Quiero restaurar archivos JSON:**
   ```bash
   # Copia desde backup
   cp config/factories/backup/before_rename_20251025_111109/* config/factories/
   ```

3. **Necesito backup de la base de datos:**
   ```bash
   # Crear backup antes de actualizar
   docker exec uns-claudejp-db pg_dump -U uns_admin uns_claudejp > backup_before_factory_update.sql
   ```

---

## ✅ Resumen:

| Aspecto | Estado |
|---------|--------|
| Archivos JSON | ✅ COMPLETADO |
| factory_id en JSON | ✅ COMPLETADO |
| Backup JSON | ✅ CREADO |
| Tabla factories | ⏳ PENDIENTE |
| Tabla employees | ⏳ PENDIENTE |
| Tabla contract_workers | ⏳ PENDIENTE |

**Siguiente paso:** Iniciar Docker y ejecutar `python update_factory_ids.py`
