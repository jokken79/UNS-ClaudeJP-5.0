# 📚 Documentación – UNS-ClaudeJP-5.0

> **Sistema de Gestión de Recursos Humanos para Empresas de Staffing Japonesas (人材派遣会社)**
>
> - **Backend:** FastAPI 0.115.6 + PostgreSQL 15 + SQLAlchemy 2.0.36
> - **Frontend:** Next.js 16.0.0 + React 19.0.0 + Tailwind CSS 3.4
> - **DevOps:** Docker Compose con 5 servicios
> - **Versión:** 5.0.0
> - **Última actualización:** 2025-10-27

---

## 🚀 Inicio Rápido

¿Primera vez con el sistema? Empieza aquí:
1. **[Instalación Rápida](./01-instalacion/instalacion_rapida.md)** - Guía de instalación paso a paso
2. **[Post Reinstalación](./04-troubleshooting/post_reinstalacion.md)** - Verificación post-instalación
3. **[Guía de Troubleshooting](./04-troubleshooting/guia.md)** - Solución de problemas comunes

---

## 📖 Documentación por Categorías

### 00 – Overview
> Documentación pendiente de completar
- [Arquitectura](./00-overview/arquitectura.md) *(pendiente)*
- [Componentes](./00-overview/componentes.md) *(pendiente)*
- [Roles y permisos](./00-overview/roles-permisos.md) *(pendiente)*

### 01 – Instalación
> Todo lo relacionado con instalación y actualización del sistema
- **[Instalación Rápida](./01-instalacion/instalacion_rapida.md)** - Guía completa de instalación desde cero
- **[Upgrade 5.x](./01-instalacion/upgrade_5.x.md)** - Actualización a Next.js 16 + React 19

### 02 – Configuración
> Configuración de base de datos, backups y migraciones
- **[Base de Datos y Migraciones](./02-configuracion/base_datos.md)** - Alembic, schemas, migraciones
- [Backup/Restore](./02-configuracion/backup_restore.md) *(pendiente de consolidar desde guides/)*

### 03 – Uso
> Guías de usuario y features principales
- [Onboarding de Candidatos (Fotos/OCR)](./03-uso/onboarding_candidatos.md) *(pendiente de consolidar)*
- **[OCR Multidocumento](./03-uso/ocr_multi_documento.md)** - Azure OCR + EasyOCR + Tesseract
- **[Temas y UI](./03-uso/temas_y_ui.md)** - Sistema de temas (12 predefinidos + custom)

### 04 – Troubleshooting
> Solución de problemas y verificación del sistema
- **[Guía de Troubleshooting](./04-troubleshooting/guia.md)** - Problemas comunes y soluciones
- **[Post Reinstalación](./04-troubleshooting/post_reinstalacion.md)** - Checklist de verificación

### 05 – DevOps
> Scripts, herramientas de desarrollo y deployment
- **[Scripts Útiles](./05-devops/scripts_utiles.md)** - Batch scripts de Windows (START.bat, STOP.bat, etc.)
- [Herramientas de Verificación](./05-devops/herramientas_verificacion.md) *(pendiente de consolidar)*

### 06 – Agentes
> Sistema de orquestación y agentes especializados (Claude Code)
- **[Orquestador y Agentes](./06-agentes/orquestador.md)** - Arquitectura de subagentes (coder, tester, research, stuck)
- [Workflows](./06-agentes/workflows.md) *(pendiente de documentar)*

### 97 – Reportes
> Auditorías, análisis y reportes de sesiones
- **[Índice de Reportes](./97-reportes/README.md)** - Todos los reportes organizados por fecha y tipo
  - Auditorías de Sistema (2025-10-24 a 2025-10-27)
  - Auditorías de Base de Datos
  - Reportes de Errores y Fixes
  - Análisis de Features (Themes, OCR, Photos)
  - Reportes de Problemas y Análisis de Sistema

### 98 – Features
> Documentación técnica de implementaciones específicas
- **[Índice de Features](./98-features/README.md)** - Implementaciones de features específicas
  - Sistema de Temas y Templates (12 temas + custom)
  - Animaciones de Navegación
  - OCR Multi-documento (Azure + EasyOCR + Tesseract)

### 99 – Archive
> Documentación histórica y legacy
- **[Archive Index](./99-archive/README.md)** - Documentación obsoleta o completada
- **[Guides Old](./99-archive/guides-old/)** - Quick starts antiguos (consolidados en documentación actual)
- **[Sessions Old](./99-archive/sessions-old/)** - Sesiones de trabajo archivadas (2025-10-23 y 2025-10-24)
- **[Root Legacy](./99-archive/root-legacy/)** - Documentación legacy del root (v3.x y v4.x)

---

## 🔍 Documentación Original Sin Consolidar

Las siguientes carpetas contienen documentación **NO consolidada** que puede tener información adicional:

- **[database/](./database/)** - Propuestas de diseño de BD (3 propuestas + análisis Excel)
- **[guides/](./guides/)** - Guías específicas (solo queda README.md - todo movido a carpetas apropiadas)

> ⚠️ **Nota:** La mayoría de los archivos de `guides/`, `reports/` y `sessions/` han sido reorganizados. Ver las secciones **97 - Reportes**, **98 - Features** y **99 - Archive** más abajo.

---

## 🗂️ Estructura del Proyecto

```
UNS-ClaudeJP-5.0/
├── backend/              # FastAPI + SQLAlchemy + PostgreSQL
├── frontend-nextjs/      # Next.js 16 + React 19 + Tailwind
├── docs/                 # 📚 ESTÁS AQUÍ
│   ├── 01-instalacion/
│   ├── 02-configuracion/    # ✅ Incluye migraciones y backups
│   ├── 03-uso/              # ✅ Incluye OCR, fotos, prints, importación
│   ├── 04-troubleshooting/  # ✅ Incluye troubleshooting y verificaciones
│   ├── 05-devops/           # ✅ Incluye scripts y Git/GitHub
│   ├── 06-agentes/          # ✅ Incluye clarificación de sistemas de agentes
│   ├── 97-reportes/         # ✅ Reportes y auditorías (de docs/reports/)
│   ├── 98-features/         # ✅ NUEVO - Implementaciones técnicas específicas
│   ├── 99-archive/          # ✅ Legacy organizado
│   │   ├── guides-old/      # ✅ NUEVO - Quick starts antiguos
│   │   ├── sessions-old/    # ✅ NUEVO - Sesiones archivadas
│   │   └── root-legacy/
│   ├── archive/             # Legacy (estructura anterior)
│   ├── database/            # Propuestas de BD (sin consolidar)
│   ├── guides/              # ✅ VACÍO - Todo movido a carpetas apropiadas
│   ├── issues/
│   └── releases/
├── scripts/              # Batch scripts (Windows)
├── docker-compose.yml
├── CLAUDE.md             # Instrucciones para Claude Code
└── README.md             # README principal del proyecto
```

---

## 💡 Tips de Navegación

- **Búsqueda rápida:** Usa Ctrl+F en esta página para encontrar documentos
- **Documentos consolidados:** Los documentos en `01-` a `06-` incluyen citas de fuentes originales
- **Información duplicada:** Si ves duplicados entre consolidados y originales, confía en consolidados
- **Contribuir:** Al agregar nueva documentación, sigue la **NORMA #7** de `CLAUDE.md`

---

## 📝 Convenciones de Documentación

Según **NORMA #7 - GESTIÓN DE ARCHIVOS .md** (ver `CLAUDE.md`):

1. **🔍 BUSCAR ANTES DE CREAR** - Verifica si existe un .md similar
2. **📝 REUTILIZAR EXISTENTE** - Agrega al documento existente con fecha
3. **📅 FORMATO DE FECHA OBLIGATORIO** - `## 📅 YYYY-MM-DD - [TÍTULO]`
4. **🚫 EVITAR DUPLICACIÓN** - No crear `NUEVO_ANALISIS.md` si existe `ANALISIS.md`

---

## 🆘 ¿Necesitas Ayuda?

- **Instalación:** [01-instalacion/instalacion_rapida.md](./01-instalacion/instalacion_rapida.md)
- **Errores:** [04-troubleshooting/guia.md](./04-troubleshooting/guia.md)
- **Scripts:** [05-devops/scripts_utiles.md](./05-devops/scripts_utiles.md)
- **Agentes:** [06-agentes/orquestador.md](./06-agentes/orquestador.md)

---

**Mantenido por:** Claude Code (Anthropic AI Assistant)
**Última consolidación:** 2025-10-27
