# 🚀 UNS-ClaudeJP 5.0 - Setup Guide

## ¿Qué Pasa Cuando Descargas el Repositorio en Otra PC?

### 📦 Archivos NO Incluidos en Git

Por seguridad y tamaño, estos archivos **NO están en GitHub**:

```
❌ config/employee_master.xlsm       (1.2 MB - Datos sensibles)
❌ config/employee_master_NEW.xlsm   (Datos backup)
❌ config/employee_master_OLD.xlsm   (Datos históricos)
❌ .env                               (Credenciales)
```

### 🔄 Comportamiento del Script

Cuando ejecutas `REINSTALAR.bat`:

#### **OPCIÓN 1: Si Tienes el Archivo Excel** ✅
```
1. REINSTALAR.bat se ejecuta
2. Sistema busca: config/employee_master.xlsm
3. ✅ ENCUENTRA el archivo
4. Importa 1000+ candidatos REALES automáticamente
5. Todo funciona perfecto
```

#### **OPCIÓN 2: Si NO Tienes el Archivo Excel** (Nueva PC)
```
1. REINSTALAR.bat se ejecuta
2. Sistema busca: config/employee_master.xlsm
3. ❌ NO encuentra el archivo
4. Muestra un mensaje informativo
5. Automáticamente importa 10 candidatos DEMO
6. ✅ Puedes usar la aplicación, pero con datos de demostración
7. Después puedes añadir el archivo real
```

## 📋 Setup Recomendado para Nueva PC

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/jokken79/UNS-ClaudeJP-4.2.git
cd UNS-ClaudeJP-4.2
```

### Paso 2: (OPCIONAL) Copiar el Archivo Excel
**Si tienes el archivo `employee_master.xlsm`:**

```bash
# Copia el archivo a:
config/employee_master.xlsm

# La estructura quedaría así:
D:\UNS-ClaudeJP-4.2\
├── config/
│   ├── employee_master.xlsm  ← Coloca aquí
│   ├── factories/
│   │   └── Factory-01.json
│   └── ...
├── scripts/
├── backend/
└── ...
```

### Paso 3: Ejecutar Setup Completo
```bash
# Windows (PowerShell o CMD)
scripts\REINSTALAR.bat

# Linux/Mac
bash scripts/REINSTALAR.bat
```

### Paso 4: Acceder a la Aplicación
```
Frontend:  http://localhost:3000
Backend:   http://localhost:8000/api/docs
Database:  http://localhost:8080

Login: admin / admin123
```

## 🔄 Cambiar Entre Demo y Datos Reales

### Si Instalaste con Demo Data y Quieres Datos Reales:

```bash
# 1. Copia el archivo Excel:
cp D:\path\to\employee_master.xlsm config/

# 2. Limpia la base de datos:
docker compose down -v

# 3. Reinicia:
scripts\REINSTALAR.bat
```

### Si Instalaste con Datos Reales y Quieres Limpiar:

```bash
# 1. Elimina el archivo Excel:
del config/employee_master.xlsm

# 2. Limpia la base de datos:
docker compose down -v

# 3. Reinicia (usará demo data):
scripts\REINSTALAR.bat
```

## 📊 Comparación: Demo vs Datos Reales

| Feature | Demo Data | Datos Reales |
|---------|-----------|-------------|
| **Candidatos** | 10 candidatos simulados | 1000+ empleados reales |
| **Datos Exactos** | Nombres ficticios | Nombres y datos reales |
| **Información** | Básica | Completa (visa, edad, nacionalidad) |
| **Factories** | 100+ fábricas reales | ✅ Importadas desde config |
| **Uso** | Demo/Testing | Producción |

## 🚨 Troubleshooting

### "No encuentro candidatos"
```
✅ Solución: Candidatos con datos reales NO aparecerán hasta que:
   1. Copies employee_master.xlsm a config/
   2. Ejecutes REINSTALAR.bat
```

### "Veo solo 10 candidatos"
```
✅ Significa: Se importaron candidatos DEMO
   📝 Para cambiar a datos reales, sigue "Cambiar Entre Demo y Datos Reales"
```

### "No se importaron los datos"
```
✅ Verificar:
   1. Docker está corriendo: docker ps
   2. Archivo Excel en config/: ls config/
   3. Permisos del archivo: ✓ Legible
```

## 📦 Archivos Que Necesitas Copiar Manualmente

| Archivo | Ubicación | Obligatorio | Tamaño |
|---------|-----------|------------|--------|
| employee_master.xlsm | `config/` | ❌ No* | 1.2 MB |
| .env** | Raíz | ✅ Sí | - |

*Solo si quieres datos REALES (si no lo tienes, se usan demo data)
**El .env se genera automáticamente con REINSTALAR.bat

## ✅ Checklist de Setup

- [ ] Clonaste el repositorio
- [ ] Copiaste employee_master.xlsm a `config/` (opcional)
- [ ] Ejecutaste `scripts\REINSTALAR.bat`
- [ ] Docker está corriendo correctamente
- [ ] Puedes acceder a http://localhost:3000
- [ ] Login funciona con admin/admin123
- [ ] Ves candidatos listados

## 🎯 Resumen

**Si tienes el archivo Excel:**
- Sistema importa 1000+ datos REALES automáticamente ✅
- TODO funciona perfecto sin configuración adicional

**Si NO tienes el archivo Excel:**
- Sistema importa 10 candidatos DEMO automáticamente ✅
- Puedes seguir usando la aplicación
- Cualquier momento puedes añadir el archivo real y reimportar

**En cualquier caso, REINSTALAR.bat lo maneja automáticamente** 🚀
