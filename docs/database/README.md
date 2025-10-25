# Documentacion de Base de Datos

## Esquema Actual

- [BD Propuesta 3 - Hibrida](BD_PROPUESTA_3_HIBRIDA.md) - Esquema de base de datos actual en uso

## Propuestas Historicas

Ver carpeta [archive/](archive/) para propuestas y analisis historicos:

- [BD Propuesta 1 - Minimalista](archive/BD_PROPUESTA_1_MINIMALISTA.md)
- [BD Propuesta 2 - Completa](archive/BD_PROPUESTA_2_COMPLETA.md)
- [Analisis Excel vs BD](archive/ANALISIS_EXCEL_VS_BD.md)
- [Resumen Analisis Excel Completo](archive/RESUMEN_ANALISIS_EXCEL_COMPLETO.md)

## Tablas Principales

El sistema utiliza 13 tablas principales:

### Tablas de Personal
- `users` - Usuarios del sistema con jerarquia de roles
- `candidates` - Registros de candidatos (履歴書/Rirekisho)
- `employees` - Trabajadores en nomina (派遣社員)
- `contract_workers` - Trabajadores por contrato (請負社員)
- `staff` - Personal de oficina/RH (スタッフ)

### Tablas de Negocio
- `factories` - Empresas cliente (派遣先)
- `apartments` - Vivienda de empleados (社宅)
- `documents` - Almacenamiento de archivos con datos OCR
- `contracts` - Contratos de empleo

### Tablas de Operaciones
- `timer_cards` - Registros de asistencia (タイムカード)
- `salary_calculations` - Calculos de nomina mensual
- `requests` - Solicitudes de empleados (有給/半休/一時帰国/退社)
- `audit_log` - Registro de auditoria completo

## Migraciones

Para gestionar migraciones de base de datos, ver:
- [Guia de Migraciones Alembic](../guides/MIGRACIONES_ALEMBIC.md)
