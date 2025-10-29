# 🤖 Sistema de Orquestación de Agentes

**Última actualización:** 2025-10-28

Este documento describe el sistema de orquestación de agentes de UNS-ClaudeJP 5.0, basado en Claude Code con contexto de 200k tokens.

---

## 📋 Visión General

El sistema utiliza un **patrón de orquestación** donde Claude Code actúa como orquestador maestro que delega tareas específicas a agentes especializados. Cada agente opera en su propio contexto limpio y tiene herramientas especializadas.

```
┌────────────────────────────────────────────┐
│  ORCHESTRATOR (Claude Code)                │
│  - Context: 200k tokens                    │
│  - Maintains big picture                   │
│  - Creates and tracks todo lists           │
│  - Delegates to specialized agents         │
└────────┬───────────────────────────────────┘
         │
         ├─► research agent (new tech docs)
         ├─► coder agent (implementation)
         ├─► tester agent (visual testing)
         └─► stuck agent (human escalation)
```

---

## 🎯 Roles de los Agentes

### 1. ORCHESTRATOR (Orquestador - Tu rol principal)

**Responsabilidades:**
- Analizar peticiones del usuario
- Crear listas detalladas de tareas (TodoWrite)
- Delegar tareas individuales a agentes especializados
- Mantener el estado del proyecto completo
- Rastrear progreso de todas las tareas
- Reportar resultados finales al usuario

**Herramientas disponibles:**
- TodoWrite - Gestión de tareas
- Task - Delegación a subagentes
- Read, Glob, Grep - Exploración de código
- Bash - Operaciones del sistema

**NO debe:**
- ❌ Implementar código directamente (delegar a coder)
- ❌ Omitir investigación de tecnologías nuevas
- ❌ Saltar testing después de implementaciones
- ❌ Perder rastro del progreso

---

### 2. RESEARCH Agent

**Propósito:** Buscar documentación de tecnologías nuevas usando Jina AI

**Cuándo invocar:**
- Cuando una tarea menciona nueva tecnología/librería/framework
- Antes de delegar a coder si hay tecnología desconocida
- Para obtener mejores prácticas y patrones

**Ejemplo de invocación:**
```typescript
Task({
  subagent_type: "research",
  description: "Research Next.js server actions",
  prompt: `
    Research Next.js server actions documentation.

    Focus on:
    - How to create server actions
    - Best practices
    - Common patterns
    - Error handling

    Save documentation to .research-cache/ for coder agent to use.
    Return the file path.
  `
})
```

**Salida:**
- Archivo markdown en `.research-cache/`
- Path del archivo para pasar a coder
- Resumen de hallazgos clave

---

### 3. CODER Agent

**Propósito:** Implementar tareas de codificación específicas

**Cuándo invocar:**
- Para cada item de la lista de tareas que requiera código
- Después de research agent si hubo investigación
- Para una tarea específica a la vez (NO múltiples)

**Ejemplo de invocación:**
```typescript
Task({
  subagent_type: "coder",
  description: "Implement login form",
  prompt: `
    Implement a login form component with the following requirements:

    Requirements:
    - Email and password inputs
    - Form validation using React Hook Form
    - Submit to /api/auth/login endpoint
    - Show error messages
    - Redirect to /dashboard on success

    ${researchFilePath ? `Documentation available at: ${researchFilePath}` : ''}

    Return a completion report with:
    - Files created/modified
    - Implementation details
    - Any issues encountered
  `
})
```

**Salida:**
- Reporte de implementación
- Lista de archivos creados/modificados
- Cualquier problema encontrado

**El coder DEBE:**
- ✅ Trabajar en un TODO a la vez
- ✅ Leer research docs si se proporcionan
- ✅ Invocar stuck agent si encuentra errores
- ✅ Reportar completitud claramente

---

### 4. TESTER Agent

**Propósito:** Verificación visual usando Playwright MCP

**Cuándo invocar:**
- DESPUÉS de CADA implementación del coder
- Para verificar que la funcionalidad trabaja correctamente
- Para capturar screenshots de la UI

**Ejemplo de invocación:**
```typescript
Task({
  subagent_type: "tester",
  description: "Test login form",
  prompt: `
    Verify the login form implementation works correctly.

    Test cases:
    1. Navigate to /login
    2. Verify form renders with email and password inputs
    3. Try login with valid credentials (admin / admin123)
    4. Verify redirect to /dashboard on success
    5. Try login with invalid credentials
    6. Verify error message shows

    Use Playwright MCP to:
    - Visit the pages
    - Take screenshots
    - Verify elements exist
    - Test interactions

    Return:
    - Pass/Fail status for each test case
    - Screenshots
    - Any issues found
  `
})
```

**Salida:**
- Estado pass/fail de cada caso de prueba
- Screenshots de la UI
- Problemas encontrados

**El tester DEBE:**
- ✅ Usar Playwright MCP para verificación visual
- ✅ Tomar screenshots de estados importantes
- ✅ Invocar stuck agent si tests fallan
- ✅ Reportar resultados claramente

---

### 5. STUCK Agent

**Propósito:** Escalación a humano para CUALQUIER problema

**Cuándo invocar:**
- Cuando tests fallan
- Cuando coder encuentra errores bloqueantes
- Cuando tester encuentra problemas
- Cuando necesitas decisión humana
- **SIEMPRE que algo sale mal**

**Ejemplo de invocación:**
```typescript
Task({
  subagent_type: "stuck",
  description: "Login tests failing",
  prompt: `
    The login form tests are failing with the following error:

    Error: Cannot find element with selector '#email-input'

    Context:
    - Implemented login form in app/login/page.tsx
    - Tests expected #email-input but component uses different ID

    Question for human:
    Should I:
    1. Update the component to use #email-input ID?
    2. Update the tests to match current implementation?
    3. Something else?

    Get human decision on how to proceed.
  `
})
```

**Salida:**
- Decisión del humano
- Instrucciones para continuar

**CRÍTICO:**
- ✅ ÚNICA herramienta con acceso a AskUserQuestion
- ✅ NO hay fallbacks permitidos
- ✅ SIEMPRE invocar cuando hay problemas

---

## 🔄 Flujo de Trabajo Completo

### Ejemplo: "Build a todo app with Next.js server actions"

```
┌──────────────────────────────────────────────────────┐
│ USER: "Build a Next.js todo app with server actions" │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ ORCHESTRATOR: Analyze & Plan                         │
│                                                       │
│ 1. Create todo list with TodoWrite:                  │
│    [ ] Research Next.js server actions               │
│    [ ] Set up Next.js project structure              │
│    [ ] Create TodoList component                     │
│    [ ] Create TodoItem component                     │
│    [ ] Implement server actions                      │
│    [ ] Add state management                          │
│    [ ] Style the app                                 │
│    [ ] Test all functionality                        │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ ORCHESTRATOR: Detect new technology                  │
│ "Next.js server actions" is new → Need research      │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ RESEARCH AGENT: Fetch documentation                  │
│                                                       │
│ - Use Jina AI to fetch Next.js server actions docs   │
│ - Save to .research-cache/nextjs-server-actions.md   │
│ - Return file path                                   │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ ORCHESTRATOR: Receives research file path            │
│ .research-cache/nextjs-server-actions.md             │
│                                                       │
│ Mark TODO #1 complete, move to TODO #2               │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ CODER AGENT: Set up Next.js project                  │
│                                                       │
│ Task: "Set up Next.js project with server actions"   │
│ Research file: .research-cache/nextjs-server-actions │
│                                                       │
│ - Read research docs                                 │
│ - Create project structure                           │
│ - Set up server actions                              │
│ - Report completion                                  │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ ORCHESTRATOR: Receives coder report                  │
│ "Created app/actions.ts, app/layout.tsx, etc."       │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ TESTER AGENT: Verify setup                           │
│                                                       │
│ Task: "Verify Next.js app runs at localhost:3000"    │
│                                                       │
│ - Use Playwright to visit localhost:3000             │
│ - Take screenshot                                    │
│ - Verify page loads                                  │
│ - Report success                                     │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ ORCHESTRATOR: Tests passed                           │
│ Mark TODO #2 complete, move to TODO #3               │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ CODER AGENT: Create TodoList component               │
│ ... (repeat cycle)                                   │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
        ... Continue for each TODO ...
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│ ORCHESTRATOR: All TODOs complete                     │
│ Report final results to USER                         │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Buenas Prácticas

### Para el Orchestrator

1. **Siempre crear lista de tareas primero**
   ```typescript
   TodoWrite({
     todos: [
       { content: "Research X", status: "pending", activeForm: "Researching X" },
       { content: "Implement Y", status: "pending", activeForm: "Implementing Y" },
       // ...
     ]
   })
   ```

2. **Una tarea a la vez**
   - NO delegues múltiples tareas simultáneamente
   - Espera que un agente complete antes de invocar el siguiente

3. **Actualizar estado inmediatamente**
   - Marca TODO como in_progress antes de delegar
   - Marca TODO como completed inmediatamente después de success

4. **Siempre testear**
   - Invocar tester después de CADA implementación de coder
   - No omitir este paso

5. **Pasar contexto completo a agentes**
   - Include research file paths
   - Describe requirements claramente
   - Especificar qué reportar de vuelta

### Para Investigación

1. **Invocar research antes de coder para tech nueva**
2. **Pasar file path de research a coder**
3. **Guardar en `.research-cache/`**

### Para Implementación

1. **Un TODO por invocación de coder**
2. **Incluir research docs si disponibles**
3. **Describir requirements específicos**
4. **Pedir reporte de completitud**

### Para Testing

1. **Test después de CADA implementación**
2. **Especificar casos de prueba claros**
3. **Pedir screenshots**
4. **Verificar visualmente con Playwright**

### Para Escalación

1. **Invocar stuck inmediatamente ante problemas**
2. **NO intentar workarounds automáticos**
3. **Proveer contexto completo del problema**
4. **Pedir decisión clara al humano**

---

## ❌ Errores Comunes a Evitar

### 1. Orchestrator implementa código directamente
```typescript
// ❌ MAL
Edit({
  file_path: "app/login/page.tsx",
  // ... implementación directa
})

// ✅ BIEN
Task({
  subagent_type: "coder",
  description: "Implement login page",
  prompt: "Create login page with email/password form..."
})
```

### 2. Omitir research para tech nueva
```typescript
// ❌ MAL - delegar directo a coder con tech nueva
Task({ subagent_type: "coder", prompt: "Use Next.js server actions..." })

// ✅ BIEN - research primero
Task({ subagent_type: "research", prompt: "Research Next.js server actions..." })
// ... esperar resultado
Task({
  subagent_type: "coder",
  prompt: "Use server actions. Docs at: " + researchPath
})
```

### 3. Omitir testing
```typescript
// ❌ MAL - coder completa, mover a siguiente TODO
// ... coder finished
TodoWrite({ /* mark #1 done, #2 in progress */ })
Task({ subagent_type: "coder", prompt: "Next task..." })

// ✅ BIEN - siempre testear primero
// ... coder finished
Task({ subagent_type: "tester", prompt: "Test implementation..." })
// ... tester passes
TodoWrite({ /* mark #1 done, #2 in progress */ })
```

### 4. Delegar múltiples tareas simultáneamente
```typescript
// ❌ MAL
Task({ subagent_type: "coder", prompt: "Implement login..." })
Task({ subagent_type: "coder", prompt: "Implement dashboard..." })

// ✅ BIEN - una a la vez
Task({ subagent_type: "coder", prompt: "Implement login..." })
// ... esperar completion
// ... testear
Task({ subagent_type: "coder", prompt: "Implement dashboard..." })
```

### 5. No invocar stuck agent ante problemas
```typescript
// ❌ MAL - intentar workaround automático
if (testFailed) {
  // try another approach...
}

// ✅ BIEN - escalar inmediatamente
if (testFailed) {
  Task({
    subagent_type: "stuck",
    prompt: "Tests failed with error X. How should I proceed?"
  })
}
```

---

## 📊 Estado y Contexto

### Orchestrator Context (200k tokens)
- **Mantiene:**
  - Lista completa de TODOs
  - Estado de cada tarea (pending/in_progress/completed)
  - Historial de delegaciones
  - Resultados de agentes
  - Visión general del proyecto

- **NO mantiene:**
  - Detalles de implementación (eso va en agentes)
  - Código completo (usa Read cuando necesario)

### Agent Context (Limpio para cada invocación)
- Cada agente recibe contexto fresco
- No hay estado compartido entre invocaciones
- Orchestrator es responsable de pasar contexto necesario

---

## 🔍 Monitoreo y Debugging

### Rastrear Progreso

```typescript
// Siempre mantener TODO list actualizado
TodoWrite({
  todos: [
    { content: "Task 1", status: "completed", activeForm: "..." },
    { content: "Task 2", status: "in_progress", activeForm: "..." },
    { content: "Task 3", status: "pending", activeForm: "..." },
  ]
})
```

### Logging de Delegaciones

Cuando delegues a un agente, documenta:
1. Qué agente invocaste
2. Qué tarea le diste
3. Qué contexto le pasaste
4. Qué esperas de vuelta

### Manejo de Errores

```
Error detectado
    ↓
¿Es bloqueante?
    ↓ Sí
Invocar stuck agent → Get human decision → Continue
    ↓ No
Log warning, continue
```

---

## 🎯 Resumen de Responsabilidades

| Agente | Responsabilidad | Herramientas Clave |
|--------|----------------|-------------------|
| **Orchestrator** | Big picture, todos, delegación | TodoWrite, Task, Read |
| **Research** | Docs de tech nueva | Jina AI, Write |
| **Coder** | Implementación | Read, Write, Edit, Bash |
| **Tester** | Verificación visual | Playwright MCP |
| **Stuck** | Escalación humana | AskUserQuestion |

---

## 📚 Referencias

- [CLAUDE.md](../../CLAUDE.md) - Reglas de desarrollo
- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) - Instrucciones del orquestador
- [openspec/AGENTS.md](../../openspec/AGENTS.md) - Sistema OpenSpec
- [AGENT_SYSTEMS_CLARIFICATION.md](AGENT_SYSTEMS_CLARIFICATION.md) - Clarificación de sistemas

---

**Recuerda:** Tú (Orchestrator) eres el director de orquesta. Los agentes son los músicos especializados. Juntos crean sinfonías de código! 🎵

---

**Última actualización:** 2025-10-28

[← Volver al Índice](../INDEX.md)
