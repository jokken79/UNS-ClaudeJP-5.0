# 📦 Guía: Backup y Restauración Automática de Datos

## ✨ ¿Qué Problema Resuelve?

Antes, cuando ejecutabas `REINSTALAR.bat`, perdías TODOS tus datos (usuarios, empleados, fábricas, etc.) y tenías que volver a cargarlos manualmente.

**Ahora**, con este sistema de backup automático, puedes:
- ✅ Guardar todos tus datos con un solo comando
- ✅ Reinstalar el sistema cuando quieras
- ✅ Recuperar tus datos automáticamente

---

## 🎯 Flujo de Trabajo Recomendado

### 1️⃣ Preparar tus Datos (Una sola vez)

1. Inicia el sistema: `scripts\START.bat`
2. Accede a http://localhost:3000
3. Crea tus usuarios reales (elimina o modifica los usuarios demo)
4. Agrega tus empleados, fábricas, candidatos, etc.
5. Verifica que todo esté como lo necesitas

### 2️⃣ Crear Backup de tus Datos

Cuando tengas todos tus datos listos:

```batch
scripts\BACKUP_DATOS.bat
```

**¿Qué hace este script?**
- Exporta TODA la base de datos PostgreSQL
- Crea 2 archivos:
  - `backend/backups/backup_20251022_143000.sql` (con fecha, para historial)
  - `backend/backups/production_backup.sql` (usado por REINSTALAR.bat)

**Cuándo ejecutarlo:**
- ✅ Después de configurar usuarios iniciales
- ✅ Después de agregar datos importantes
- ✅ Antes de hacer cambios grandes en el sistema
- ✅ Regularmente como medida de seguridad

### 3️⃣ Reinstalar con tus Datos

Cuando necesites reinstalar (actualización, error grave, etc.):

```batch
scripts\REINSTALAR.bat
```

**¿Qué pasa ahora?**

El script detecta automáticamente si tienes un backup guardado:

```
[5.3] Verificando si existe backup de producción...

✅ Backup encontrado: backend\backups\production_backup.sql

¿Deseas restaurar tus datos guardados? (S/N):
```

**Si presionas `S`:**
- ✅ Reinstala el sistema completo
- ✅ Restaura TODOS tus datos guardados
- ✅ Tus usuarios, empleados, fábricas, etc. vuelven exactamente como estaban

**Si presionas `N`:**
- ⚠️ Usa datos demo por defecto (admin/admin123)
- Solo hazlo si quieres empezar de cero

---

## 🛠️ Scripts Disponibles

### BACKUP_DATOS.bat
**Cuándo usar:** Cuando quieras guardar el estado actual de la base de datos

```batch
scripts\BACKUP_DATOS.bat
```

**Resultado:**
```
backend/backups/
├── backup_20251022_143000.sql    ← Backup con fecha (historial)
├── backup_20251022_150000.sql    ← Otro backup
├── backup_20251022_183000.sql    ← Otro backup
└── production_backup.sql          ← El que usa REINSTALAR.bat (siempre actualizado)
```

### RESTAURAR_DATOS.bat
**Cuándo usar:** Si quieres restaurar datos sin reinstalar todo el sistema

```batch
scripts\RESTAURAR_DATOS.bat
```

⚠️ **ADVERTENCIA:** Esto REEMPLAZA todos los datos actuales con los del backup

### REINSTALAR.bat (Mejorado)
**Cuándo usar:** Cuando necesites reinstalar el sistema completo

```batch
scripts\REINSTALAR.bat
```

**Ahora incluye:**
- Detección automática de backup
- Pregunta si quieres restaurar tus datos
- Restauración automática si dices que sí

---

## 💡 Casos de Uso Prácticos

### Caso 1: Preparar el Sistema para Producción

```batch
# 1. Iniciar sistema
scripts\START.bat

# 2. Configurar usuarios reales desde la web:
#    - Ir a http://localhost:3000
#    - Crear usuarios (admin, coordinadores, etc.)
#    - Eliminar/modificar usuarios demo

# 3. Agregar datos desde la web o importar Excel:
#    - Empleados
#    - Fábricas
#    - Candidatos

# 4. Guardar todo en backup
scripts\BACKUP_DATOS.bat

# ✅ Ahora puedes reinstalar cuando quieras sin perder estos datos
```

### Caso 2: Actualizar el Sistema

```batch
# 1. Crear backup de seguridad primero
scripts\BACKUP_DATOS.bat

# 2. Hacer git pull para obtener actualizaciones
git pull origin main

# 3. Reinstalar con nuevas actualizaciones
scripts\REINSTALAR.bat
# → Cuando pregunte, presiona S para restaurar tus datos

# ✅ Sistema actualizado con tus datos intactos
```

### Caso 3: Recuperar de un Error

```batch
# Si algo sale mal:
# 1. Reinstalar todo
scripts\REINSTALAR.bat

# 2. Cuando pregunte si restaurar datos, presiona S
# ✅ Sistema restaurado a estado funcional con tus datos
```

### Caso 4: Migrar a Otro PC

```batch
# En el PC original:
# 1. Crear backup
scripts\BACKUP_DATOS.bat

# 2. Copiar todo el proyecto a USB/nube
#    (incluyendo backend/backups/production_backup.sql)

# En el PC nuevo:
# 1. Copiar proyecto desde USB/nube
# 2. Instalar Docker Desktop
# 3. Reinstalar sistema
scripts\REINSTALAR.bat
# → Presiona S cuando pregunte

# ✅ Sistema completo en el nuevo PC con todos tus datos
```

---

## 📊 ¿Qué Datos se Guardan?

El backup incluye **TODA** la base de datos PostgreSQL:

### Tablas de Datos:
- ✅ `users` - Todos los usuarios
- ✅ `employees` - Empleados
- ✅ `candidates` - Candidatos
- ✅ `factories` - Fábricas/empresas
- ✅ `timer_cards` - Registros de asistencia
- ✅ `salary_calculations` - Cálculos de nómina
- ✅ `requests` - Solicitudes
- ✅ `apartments` - Apartamentos
- ✅ `contracts` - Contratos
- ✅ `documents` - Documentos subidos
- ✅ Y todas las demás tablas...

### Estructura:
- ✅ Definiciones de tablas
- ✅ Índices
- ✅ Constraints (claves primarias, foráneas)
- ✅ Triggers
- ✅ Secuencias

---

## 🔒 Seguridad y Mejores Prácticas

### ✅ Hacer Backups Regularmente

```batch
# Backup semanal (por ejemplo, cada viernes)
scripts\BACKUP_DATOS.bat
```

### ✅ Verificar el Backup

Después de crear un backup, verifica que existe:
```batch
dir backend\backups
```

Deberías ver:
```
backend\backups\
├── production_backup.sql    ← Archivo principal
├── backup_20251022_143000.sql
└── README.md
```

### ✅ Limpiar Backups Antiguos

Los backups con fecha se acumulan. Limpia los muy antiguos manualmente:

```batch
# Navegar a la carpeta
cd backend\backups

# Ver todos los backups
dir *.sql

# Eliminar backups muy antiguos (ejemplo)
del backup_20250101_*.sql
```

### ⚠️ NO Subir Backups a GitHub

Los archivos `.sql` ya están en `.gitignore`, así que NO se subirán accidentalmente.

### 📁 Guardar Backups en Lugar Seguro

Copia manualmente `production_backup.sql` a:
- ✅ USB externa
- ✅ Nube (Google Drive, Dropbox)
- ✅ Servidor de backups de la empresa

---

## ❓ Preguntas Frecuentes

### ¿Puedo hacer backup mientras el sistema está corriendo?
✅ **SÍ**. El backup se hace con el sistema en funcionamiento, no afecta el servicio.

### ¿Cuánto espacio ocupan los backups?
📊 Típicamente 100KB - 10MB, dependiendo de cuántos datos tengas.

### ¿Puedo restaurar backups antiguos?
✅ **SÍ**. Copia cualquier `backup_FECHA.sql` a `production_backup.sql` y ejecuta `RESTAURAR_DATOS.bat`.

### ¿Se guardan las contraseñas de usuarios?
✅ **SÍ**. Las contraseñas están hasheadas (seguras) y se restauran correctamente.

### ¿Qué pasa si borro accidentalmente `production_backup.sql`?
⚠️ Copia cualquier otro backup con fecha y renómbralo a `production_backup.sql`.

### ¿Funcionan los backups entre versiones del sistema?
⚠️ Generalmente SÍ, pero si hay cambios mayores en la estructura de la base de datos (migraciones), puede requerir ajustes.

---

## 🎉 Resumen

**Antes:**
```
REINSTALAR.bat → ❌ Pierdes todos los datos
```

**Ahora:**
```
BACKUP_DATOS.bat → Guardas tus datos
REINSTALAR.bat   → ✅ Recuperas tus datos automáticamente
```

**¡Nunca más pierdas tus datos configurados!** 🚀
