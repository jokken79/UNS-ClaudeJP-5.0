# 🚀 Actualización Rápida a UNS-ClaudeJP 5.0

> **Versión 5.0** - Next.js 16 + React 19 + Turbopack

---

## 🛠️ Novedades 5.0.1

- 🔐 `generate_env.py` crea `.env` seguros para raíz, backend y frontend con validación automática.
- 🧪 QA automatizada completa: `npm run test`, `npm run test:e2e`, `pytest`, `ruff`, `black`, `mypy` y GitHub Actions (lint → test → build).
- 📈 Observabilidad lista para producción con OpenTelemetry, Prometheus, Tempo y Grafana (dashboard incluido).
- 🐳 Docker Compose reorganizado con perfiles `dev`/`prod`, healthchecks encadenados y servicios de telemetría.
- 🎯 Frontend con Vitest + Testing Library, Playwright E2E del flujo "login → imprimir 履歴書" y `next/image` en la vista de impresión.

---

## ⚡ Inicio Rápido (1 Comando)

```bash
scripts\UPGRADE_TO_5.0.bat
```

**Eso es todo.** El script hará todo automáticamente en 5-10 minutos.

---

## 🔑 Variables de Entorno

Genera los `.env` locales con credenciales seguras (no se commitean):

```bash
python generate_env.py
```

Esto produce:

- `./.env` → usado por Docker Compose
- `./backend/.env` → desarrollo local FastAPI
- `./frontend-nextjs/.env.local` → Next.js

> Usa `python generate_env.py --force` para regenerar claves si es necesario.

Variables destacadas:

| Variable | Uso |
|----------|-----|
| `ENABLE_TELEMETRY` | Activa OpenTelemetry y métricas |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint del collector (por defecto `otel-collector:4317`) |
| `NEXT_PUBLIC_OTEL_EXPORTER_URL` | Exportador OTLP HTTP desde el navegador |
| `NEXT_PUBLIC_GRAFANA_URL` | URL de Grafana para enlaces rápidos |

---

## 🧪 QA: Scripts Clave

```bash
npm run lint          # ESLint + Prettier
npm run typecheck     # TypeScript estricto
npm run test          # Vitest + Testing Library
npm run test:e2e      # Playwright login → candidatos → impresión

cd backend
ruff check app tests
black --check app tests
mypy app
pytest
```

El workflow `Continuous Integration` ejecuta todo este pipeline en cada PR.

---

## 📈 Observabilidad Integrada

1. Levanta el stack completo:

   ```bash
   docker compose --profile dev up --build
   ```

2. Servicios disponibles:

   | Servicio | URL | Nota |
   |----------|-----|------|
   | Grafana | http://localhost:3001 | Usuario/clave por defecto `admin/admin` |
   | Prometheus | http://localhost:9090 | Métricas backend + collector |
   | Tempo | http://localhost:3200 | Endpoint OTLP para trazas |

3. Dashboard inicial: **UNS ClaudeJP Observability** (latencia API, tasa de errores, KPIs OCR).

> Exporta las trazas a Tempo automáticamente gracias a OpenTelemetry en backend y navegador.

---

## 🐳 Perfiles Docker

| Perfil | Comando | Servicios |
|--------|---------|-----------|
| `dev` | `docker compose --profile dev up` | Código montado, `uvicorn --reload`, Next.js `npm run dev`, Adminer |
| `prod` | `docker compose --profile prod up --build` | Contenedores listos para producción con `uvicorn --workers`, Next.js standalone |

Ambos perfiles incluyen la cadena de observabilidad (`otel-collector`, `prometheus`, `tempo`, `grafana`).

---

## 📋 ¿Qué incluye esta actualización?

| Componente | Antes | Después |
|------------|-------|---------|
| Next.js | 15.5.5 | **16.0.0** ⬆️ |
| React | 18.3.0 | **19.0.0** ⬆️ |
| Bundler | Webpack | **Turbopack** ⚡ |
| Versión App | 4.2.0 | **5.0.0** 🎉 |

---

## 🎯 Beneficios

- ⚡ **70% más rápido** en desarrollo (Turbopack)
- 🚀 **35% más rápido** en builds de producción
- 📦 **Mejor caching** con PPR y SWR
- ✨ **Nuevas features** de React 19
- 🔧 **Mejor DX** (Developer Experience)

---

## 📚 Documentación Completa

- **Guía detallada:** `docs/UPGRADE_5.0.md`
- **Checklist de verificación:** `docs/VERIFICACION_5.0.md`
- **Script de actualización:** `scripts/UPGRADE_TO_5.0.bat`

---

## ⏱️ Tiempo Estimado

- **Automático:** 5-10 minutos
- **Manual:** 10-15 minutos
- **Verificación:** 5-10 minutos

**Total:** ~20-30 minutos

---

## ✅ Requisitos Previos

- [x] Docker Desktop instalado y ejecutándose
- [x] Git con cambios commiteados (si los hay)
- [x] Puertos 3000, 8000, 5432, 8080 disponibles
- [x] Conexión a internet estable

---

## 🆘 Problemas?

1. **Revisa:** `docs/UPGRADE_5.0.md` > Sección "Troubleshooting"
2. **Logs:** `docker logs -f uns-claudejp-frontend`
3. **Restaurar:** `git reset --hard HEAD~1` (si es necesario)

---

## 🎉 Después de la Actualización

Visita:
- 🌐 **Frontend:** http://localhost:3000
- 📚 **API Docs:** http://localhost:8000/api/docs
- 🗄️ **Adminer:** http://localhost:8080
- 📊 **Grafana:** http://localhost:3001

Credenciales:
- **Usuario:** `admin`
- **Password:** `admin123`

---

**¡Disfruta de Next.js 16!** 🚀

---

## 📞 Soporte

- 📖 Documentación: `docs/UPGRADE_5.0.md`
- ✅ Verificación: `docs/VERIFICACION_5.0.md`
- 🔧 Script: `scripts/UPGRADE_TO_5.0.bat`

---

**Versión:** 5.0.1
**Fecha:** 05 de Diciembre de 2025
**Commit:** TBD
