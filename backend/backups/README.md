# 📦 Sistema de Backup y Restauración Automática

Esta carpeta contiene los backups de la base de datos PostgreSQL del sistema UNS-ClaudeJP.

## 📁 Archivos

- **`production_backup.sql`**: Backup principal que se usa automáticamente en `REINSTALAR.bat`
- **`backup_YYYYMMDD_HHMMSS.sql`**: Backups con fecha/hora para historial

## 🔄 Cómo Funciona

### 1️⃣ Crear Backup de tus Datos

Cuando tengas todos tus datos listos (usuarios, empleados, fábricas, etc.):

```bash
# Ejecutar desde la raíz del proyecto
scripts\BACKUP_DATOS.bat
```

Esto creará:
- Un backup con fecha: `backup_20251022_143000.sql`
- El backup de producción: `production_backup.sql` (usado por REINSTALAR.bat)

### 2️⃣ Reinstalar con tus Datos

Cuando ejecutes `REINSTALAR.bat`, el sistema:

1. Borra todo (contenedores, volúmenes, imágenes)
2. Reconstruye el sistema desde cero
3. **DETECTA** si existe `production_backup.sql`
4. **PREGUNTA** si quieres restaurar tus datos
5. Si dices **SÍ**: Restaura tus datos guardados
6. Si dices **NO**: Usa datos demo por defecto

### 3️⃣ Restaurar Manualmente

Si necesitas restaurar datos sin reinstalar todo:

```bash
scripts\RESTAURAR_DATOS.bat
```

## ⚠️ Importante

- **SIEMPRE** ejecuta `BACKUP_DATOS.bat` antes de `REINSTALAR.bat`
- Los backups con fecha se conservan para historial
- `production_backup.sql` se sobrescribe en cada backup nuevo
- Los backups NO se borran automáticamente (debes limpiar manualmente si ocupan mucho espacio)

## 💡 Flujo Recomendado

```
1. Trabajar en el sistema (agregar usuarios, datos, etc.)
2. Cuando tengas datos importantes → BACKUP_DATOS.bat
3. Si necesitas reinstalar → REINSTALAR.bat
4. El sistema detectará el backup y preguntará si restaurar
5. ✅ Tus datos personalizados se cargan automáticamente
```

## 🔒 Seguridad

- Los backups están en **texto plano** (SQL)
- **NO** subir a repositorios públicos si contienen datos sensibles
- Agregar `backend/backups/*.sql` al `.gitignore` (ya incluido)

## 📊 Tamaño de Backups

Los backups incluyen:
- Toda la estructura de la base de datos
- Todos los datos de todas las tablas
- Secuencias, índices, triggers, etc.

Tamaño típico: 100KB - 10MB (dependiendo de cuántos datos tengas)
