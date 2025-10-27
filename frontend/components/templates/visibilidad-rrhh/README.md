# Plantilla Visibilidad RRHH

Nueva plantilla de tema/layout para el sistema de gestión de RRHH de agencias japonesas.

## 📦 Componentes Incluidos

### 1. **NavItem.tsx** - Elemento de Navegación
- Componente reutilizable para elementos de menú
- Soporte para iconos Lucide React
- Indicador visual de página activa
- Estilos condicionales (activo/inactivo)
- Transiciones suaves

**Props:**
```typescript
interface NavItemProps {
  href: string;           // URL del enlace
  icon: LucideIcon;      // Icono de Lucide React
  label: string;         // Texto del elemento
}
```

**Uso:**
```tsx
import { NavItem } from '@/components/templates/visibilidad-rrhh';
import { LayoutDashboard } from 'lucide-react';

<NavItem 
  href="/dashboard" 
  icon={LayoutDashboard} 
  label="Dashboard" 
/>
```

### 2. **Sidebar.tsx** - Barra Lateral Navegación
- Layout sidebar completo con navegación estructurada
- Grupos de menú categorizados (PRINCIPAL, TIEMPO Y NÓMINA, OTROS)
- Scroll automático para menús largos
- Header y footer personalizados
- Sticky positioning

**Estructura de Grupos:**
```typescript
- PRINCIPAL
  - Dashboard
  - Candidatos
  - Empleados
  - Fábricas

- TIEMPO Y NÓMINA
  - Asistencia
  - Nómina
  - Solicitudes

- OTROS
  - Base de Datos DD
  - Reportes
  - Configuración
  - Ayuda
```

**Uso:**
```tsx
import { Sidebar } from '@/components/templates/visibilidad-rrhh';

export default function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## 🎨 Customización

### Via Store (Zustand)
```tsx
import { useVisibilidadTemplateStore } from '@/stores/visibilidad-template-store';

function MyComponent() {
  const { activeTemplate, setActiveTemplate } = useVisibilidadTemplateStore();
  
  // Usar template
  return <div className={activeTemplate?.sidebar.backgroundColor} />;
}
```

### Colores Personalizables
```typescript
{
  colors: {
    primary: '#2563eb',
    secondary: '#1e40af',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
  },
  sidebar: {
    backgroundColor: 'bg-white',
    activeItemBg: 'bg-blue-50',
    activeItemText: 'text-blue-700',
    activeItemBorder: 'border-blue-600',
  }
}
```

## 🚀 Instalación

### 1. Dependencias Requeridas
```bash
npm install lucide-react zustand
```

### 2. Importar en tu layout
```tsx
import { Sidebar } from '@/components/templates/visibilidad-rrhh';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <div className="flex">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

## 📁 Estructura de Archivos

```
components/
├── templates/
│   └── visibilidad-rrhh/
│       ├── NavItem.tsx           # Componente item de navegación
│       ├── Sidebar.tsx           # Componente sidebar principal
│       └── index.ts              # Exports

stores/
├── visibilidad-template-store.ts # Store Zustand para temas
```

## 🎯 Funcionalidades

✅ Navegación con Lucide React icons
✅ Indicador visual de página activa (App Router compatible)
✅ Grupos de menú organizados
✅ Responsive design
✅ Sistema de temas personalizable vía Zustand
✅ Transiciones suaves
✅ Scroll automático en menú largo
✅ Footer con descripción del sistema

## 🔄 Store: useVisibilidadTemplateStore

Gestiona múltiples templates/temas guardados en localStorage:

```typescript
const {
  templates,           // Array de templates guardados
  activeTemplate,      // Template actualmente activo
  addTemplate,         // Agregar nuevo template
  updateTemplate,      // Actualizar template existente
  deleteTemplate,      // Eliminar template
  setActiveTemplate,   // Cambiar template activo
  getDefaultTemplate   // Obtener template por defecto
} = useVisibilidadTemplateStore();
```

## 📊 Ejemplo Completo

```tsx
'use client';

import { Sidebar } from '@/components/templates/visibilidad-rrhh';
import { useVisibilidadTemplateStore } from '@/stores/visibilidad-template-store';

export default function DashboardLayout({ children }) {
  const { activeTemplate } = useVisibilidadTemplateStore();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTemplate?.name}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## 🎨 Palette por Defecto

| Elemento | Color |
|----------|-------|
| Primary | #2563eb (Blue) |
| Secondary | #1e40af (Dark Blue) |
| Background | #ffffff (White) |
| Text | #1f2937 (Gray-800) |
| Border | #e5e7eb (Gray-200) |
| Active Item BG | bg-blue-50 |
| Active Item Text | text-blue-700 |

## 📝 Notas

- Compatible con Next.js 15+ App Router
- Usa TypeScript 5.6+
- Tailwind CSS 3.4+ requerido
- Lucide React icons: 451+ iconos disponibles
- localStorage persistence automática

## 🔧 Troubleshooting

### Iconos no aparecen
- Asegúrate de importar de `lucide-react`
- Verifica que lucide-react esté instalado

### Estilos no aplican
- Verifica que Tailwind CSS esté configurado
- Asegúrate de que tailwind.config.ts incluya `./components/**/*.tsx`

### Active state no funciona
- Usa `usePathname()` de `next/navigation`
- En App Router, `useRouter()` no funciona para pathname

---

**Versión:** 1.0.0  
**Última Actualización:** 2025-10-26
