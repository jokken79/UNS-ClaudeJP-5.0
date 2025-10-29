# 🤖 Claude 007 Agents - Guía de Uso

**Sistema completo de 88 agentes especializados en 18 categorías**

---

## 📋 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Categorías de Agentes](#categorías-de-agentes)
3. [Uso Básico](#uso-básico)
4. [Flujos de Trabajo Avanzados](#flujos-de-trabajo-avanzados)
5. [Agentes Recomendados para UNS-ClaudeJP](#agentes-recomendados-para-uns-claudejp)

---

## 🚀 Instalación

### Paso 1: Clonar el repositorio

Ya lo tienes clonado en: `D:\UNS-ClaudeJP-5.0\claude-007-agents`

### Paso 2: Ejecutar el instalador

```bash
# Windows
cd D:\UNS-ClaudeJP-5.0
scripts\INSTALL_007_AGENTS.bat
```

**Opción recomendada**: Selecciona opción 1 (Instalar a proyecto)

### Paso 3: Verificar instalación

El script verificará automáticamente que los 88+ agentes estén instalados correctamente.

---

## 📁 Categorías de Agentes

### 🎯 Context Orchestrators (Coordinadores de Contexto)

Agentes que preparan y coordinan desarrollo autónomo:

- **`@vibe-coding-coordinator`** - Preparación autónoma (15-20 min)
- **`@exponential-planner`** - Planificación a largo plazo consciente de capacidades de IA
- **`@session-manager`** - Preservación de estado y flujos reanudables

**Cuándo usar**: Proyectos complejos que requieren coordinación extensa

### 🔒 Safety Specialists (Especialistas en Seguridad)

Análisis de seguridad arquitectónica y gestión de riesgos:

- **`@leaf-node-detector`** - Análisis de zonas seguras para desarrollo autónomo
- **`@permission-escalator`** - Gestión dinámica de permisos con evaluación de riesgos
- **`@verification-specialist`** - Estrategias de testing legibles para humanos
- **`@agent-environment-simulator`** - Testing pre-despliegue y validación de agentes

**Cuándo usar**: Modificaciones a sistemas críticos o legacy

### ⚡ Performance Optimizers (Optimizadores de Rendimiento)

Coordinación multi-agente y optimización de recursos:

- **`@parallel-coordinator`** - Ejecución paralela de múltiples agentes
- **`@tool-batch-optimizer`** - Batching eficiente de herramientas
- **`@session-optimizer`** - Gestión de contexto y eficiencia de tokens

**Cuándo usar**: Proyectos grandes con múltiples tareas concurrentes

### 🏗️ Backend Frameworks

Expertos en frameworks backend específicos:

- **`@rails-expert`** - Ruby on Rails, ActiveRecord, APIs Rails
- **`@django-expert`** - Django ORM, REST APIs, middleware
- **`@laravel-backend-expert`** - Laravel/PHP, Eloquent ORM
- **`@typescript-cockatiel-resilience`** - Node.js con patrones de resiliencia
- **`@go-resilience-engineer`** - Go con tolerancia a fallos
- **`@python-hyx-resilience`** - Python elite con patrones async

**Cuándo usar**: Desarrollo backend con frameworks específicos

### ⚛️ Frontend Frameworks

Expertos en frameworks frontend:

- **`@react-component-architect`** - Diseño de componentes React
- **`@react-state-manager`** - Redux, Context API, hooks personalizados
- **`@react-nextjs-expert`** - SSR, routing, optimizaciones Next.js
- **`@vue-component-architect`** - Componentes Vue, Composition API
- **`@vue-nuxt-expert`** - Server-side rendering, módulos Nuxt

**Para UNS-ClaudeJP**: `@react-nextjs-expert` es ideal para Next.js 16

### 🛡️ Security & DevSecOps

Especialistas en seguridad:

- **`@security-specialist`** - Análisis de seguridad, mejores prácticas
- **`@devsecops-engineer`** - Integración de seguridad en CI/CD
- **`@privacy-engineer`** - Cumplimiento de privacidad (GDPR, CCPA)

**Para UNS-ClaudeJP**: Crítico para datos de empleados japoneses

### 🗄️ Database & ORM

Expertos en bases de datos:

- **`@database-admin`** - Administración de bases de datos
- **`@rails-activerecord-expert`** - ActiveRecord (Rails)
- **`@django-orm-expert`** - Django ORM

**Para UNS-ClaudeJP**: Útil para optimización de PostgreSQL

### 💼 Business & Product

Gestión de producto y análisis:

- **`@product-manager`** - Gestión de producto, roadmaps
- **`@business-analyst`** - Análisis de negocio, requisitos
- **`@ux-designer`** - Diseño de experiencia de usuario

### 🔧 Core Development

Agentes de desarrollo fundamentales:

- **`@software-engineering-expert`** - Calidad de código, arquitectura
- **`@code-reviewer`** - Revisión de código, QA
- **`@orchestrator`** - Análisis multi-dimensional, coordinación
- **`@code-archaeologist`** - Análisis de código legacy
- **`@documentation-specialist`** - Documentación técnica
- **`@git-expert`** - Git, PRs, resolución de conflictos

### 🚀 DevOps & Infrastructure

Infraestructura y operaciones:

- **`@devops-troubleshooter`** - Solución de problemas DevOps
- **`@cloud-architect`** - Arquitectura cloud
- **`@terraform-specialist`** - Infraestructura como código
- **`@cicd-pipeline-engineer`** - CI/CD, pipelines

**Para UNS-ClaudeJP**: Útil para despliegue con Docker Compose

### 🤖 AI/ML

Machine Learning e IA:

- **`@machine-learning-engineer`** - Modelos ML, training
- **`@nlp-llm-integration-expert`** - Integración de LLMs
- **`@computer-vision-specialist`** - Visión por computadora

**Para UNS-ClaudeJP**: Útil para mejorar el sistema OCR

### 📊 Data & Analytics

Datos y análisis:

- **`@data-engineer`** - Pipelines de datos
- **`@analytics-implementation-specialist`** - Implementación de analytics
- **`@business-intelligence-developer`** - BI, dashboards

---

## 🎯 Uso Básico

### Sintaxis General

```bash
claude "Use @agent-name to [task description]"
```

### Ejemplos Simples

```bash
# Revisar código
claude "Use @code-reviewer to review the authentication module"

# Optimizar rendimiento
claude "Use @performance-optimizer to analyze and optimize the candidate search query"

# Documentar API
claude "Use @documentation-specialist to create API documentation for the salary endpoints"

# Resolver conflictos Git
claude "Use @git-expert to resolve merge conflicts in the frontend"
```

### Ejemplos con Múltiples Agentes

```bash
# Análisis de seguridad completo
claude "Use @security-specialist and @code-reviewer to audit the payroll calculation system"

# Desarrollo backend con resiliencia
claude "Use @resilience-engineer and @django-expert to add circuit breakers to the OCR service"

# Frontend con Next.js
claude "Use @react-nextjs-expert to optimize the candidate list page for SSR"
```

---

## 🚀 Flujos de Trabajo Avanzados

### 1. Vibe Coding Flow (Desarrollo Autónomo)

**Para tareas complejas que requieren preparación extensa**:

```bash
claude "Use @vibe-coding-coordinator to autonomously build the employee analytics dashboard"
```

**Fases**:
1. Context Gathering (15-20 min) - Análisis exhaustivo
2. Safety Analysis - Detección de zonas seguras
3. Autonomous Development - Implementación
4. Verification - Validación

### 2. Exponential Development (Planificación a Largo Plazo)

**Para proyectos multi-fase con escalabilidad futura**:

```bash
claude "Use @exponential-planner to create a 6-month roadmap for the HR system modernization"
```

**Fases**:
1. Capability Assessment - Evaluar capacidades actuales de IA
2. Multi-Phase Planning - Planificación progresiva
3. Progressive Implementation - Implementación por fases
4. Future-Proofing - Preparación para futuras capacidades

### 3. Parallel Coordination (Desarrollo Paralelo)

**Para tareas que pueden ejecutarse concurrentemente**:

```bash
claude "Use @parallel-coordinator with @react-nextjs-expert, @django-expert, and @database-admin to optimize the entire candidate management flow"
```

**Fases**:
1. Task Decomposition - Dividir tareas
2. Agent Assignment - Asignar agentes
3. Coordinated Execution - Ejecución paralela
4. Integration - Integración de resultados

### 4. Safety-First Autonomous (Desarrollo Seguro)

**Para modificar código crítico o legacy**:

```bash
claude "Use @leaf-node-detector to analyze the payroll calculation module, then use @permission-escalator for safe autonomous development"
```

---

## 💡 Agentes Recomendados para UNS-ClaudeJP

### Para Backend (FastAPI + Python)

```bash
# Desarrollo general
@python-hyx-resilience  # Python elite con async patterns
@resilience-engineer    # Circuit breakers, retry logic
@logging-concepts-engineer  # JSON logging estructurado

# APIs
@api-architect          # Diseño de APIs REST
@security-specialist    # Seguridad de APIs

# Base de datos
@database-admin         # Optimización PostgreSQL
@performance-optimizer  # Query optimization
```

### Para Frontend (Next.js 16 + React 19)

```bash
# Next.js específico
@react-nextjs-expert    # SSR, App Router, optimizaciones

# React general
@react-component-architect  # Componentes reutilizables
@react-state-manager   # Zustand, React Query

# UI/UX
@tailwind-css-expert   # Tailwind CSS responsive design
@ux-designer          # Diseño de experiencia de usuario
```

### Para Sistema de Temas

```bash
@frontend-developer    # Implementación general de UI
@react-component-architect  # Theme system architecture
@documentation-specialist  # Documentar sistema de temas
```

### Para Sistema OCR

```bash
@computer-vision-specialist  # Optimización OCR
@machine-learning-engineer  # Mejora de modelos
@python-hyx-resilience     # Integración async de OCR
```

### Para DevOps

```bash
@devops-troubleshooter  # Problemas con Docker
@cicd-pipeline-engineer  # GitHub Actions CI/CD
@cloud-architect        # Arquitectura de despliegue
```

### Para Documentación

```bash
@documentation-specialist  # Docs técnicas
@code-reviewer           # Review de documentación
@ux-designer            # UX de documentación
```

---

## 📖 Flujos de Trabajo Específicos para UNS-ClaudeJP

### Agregar Nueva Funcionalidad de OCR

```bash
# Paso 1: Análisis y planificación
claude "Use @vibe-coding-coordinator to analyze requirements for adding passport OCR support"

# Paso 2: Implementación con seguridad
claude "Use @computer-vision-specialist and @python-hyx-resilience to implement passport OCR with error handling"

# Paso 3: Testing
claude "Use @verification-specialist to create test cases for passport OCR"

# Paso 4: Documentación
claude "Use @documentation-specialist to document the new passport OCR feature"
```

### Optimizar Rendimiento de Dashboard

```bash
# Paso 1: Análisis
claude "Use @performance-optimizer to profile the dashboard performance"

# Paso 2: Optimización frontend
claude "Use @react-nextjs-expert to optimize dashboard with SSR and caching"

# Paso 3: Optimización backend
claude "Use @database-admin to optimize dashboard queries"

# Paso 4: Verificación
claude "Use @verification-specialist to verify performance improvements"
```

### Agregar Nueva Página Next.js

```bash
# Paso 1: Diseño
claude "Use @ux-designer and @react-component-architect to design the new employee benefits page"

# Paso 2: Implementación
claude "Use @react-nextjs-expert to implement the page using App Router"

# Paso 3: Estado y API
claude "Use @react-state-manager to add state management with Zustand"

# Paso 4: Review
claude "Use @code-reviewer to review the implementation"
```

### Agregar Endpoint API

```bash
# Paso 1: Diseño de API
claude "Use @api-architect to design the employee benefits calculation API"

# Paso 2: Implementación
claude "Use @python-hyx-resilience to implement the endpoint with FastAPI"

# Paso 3: Seguridad
claude "Use @security-specialist to audit the endpoint for vulnerabilities"

# Paso 4: Documentación
claude "Use @documentation-specialist to create OpenAPI documentation"
```

---

## 🎓 Mejores Prácticas

### 1. Usar el Agente Correcto

- **Backend Python**: `@python-hyx-resilience`, no `@rails-expert`
- **Next.js**: `@react-nextjs-expert`, no `@vue-nuxt-expert`
- **PostgreSQL**: `@database-admin`, no framework-specific ORM experts

### 2. Combinar Agentes Complementarios

```bash
# ✅ Bueno: Combinar especialistas
claude "Use @api-architect and @security-specialist to design secure payment API"

# ❌ Malo: Usar agentes redundantes
claude "Use @rails-expert and @django-expert for FastAPI endpoint"  # Ninguno es apropiado
```

### 3. Usar Coordinadores para Tareas Complejas

```bash
# Para tareas grandes, empezar con coordinadores
claude "Use @vibe-coding-coordinator to build complete payroll module"
claude "Use @exponential-planner to create 6-month modernization plan"
claude "Use @parallel-coordinator to optimize multiple modules simultaneously"
```

### 4. Seguridad Primero en Código Crítico

```bash
# Antes de modificar código crítico
claude "Use @leaf-node-detector to analyze safe zones in authentication system"
claude "Use @permission-escalator to setup permissions for salary calculation changes"
```

### 5. Documentar Después de Implementar

```bash
# Siempre documentar cambios significativos
claude "Use @documentation-specialist to document the new OCR passport feature"
```

---

## 🔗 Enlaces Útiles

- **Repositorio oficial**: https://github.com/avivl/claude-007-agents
- **README completo**: `D:\UNS-ClaudeJP-5.0\claude-007-agents\README.md`
- **Documentación CLAUDE.md**: `D:\UNS-ClaudeJP-5.0\claude-007-agents\CLAUDE.md`
- **Scripts de instalación**: `D:\UNS-ClaudeJP-5.0\scripts\INSTALL_007_AGENTS.bat`

---

## 💬 Soporte

¿Problemas con agentes? Usa:

```bash
# Verificar instalación
scripts\INSTALL_007_AGENTS.bat  # Selecciona opción 5

# Ver lista completa de agentes
scripts\INSTALL_007_AGENTS.bat  # Selecciona opción 4

# Reinstalar agentes
scripts\INSTALL_007_AGENTS.bat  # Selecciona opción 1 o 2
```

---

**🎯 Sistema listo para desarrollo con 88 agentes especializados!** 🚀
