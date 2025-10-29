# 🚀 Guía Rápida: Plantilla Visibilidad RRHH

## Instalación en 5 pasos

### 1. ✅ Verificar Dependencias
```bash
npm list lucide-react zustand
```

Las dependencias ya están instaladas en `package.json`:
- ✅ `lucide-react@^0.451.0`
- ✅ `zustand@^5.0.8`

### 2. 📁 Archivos Creados
```
frontend-nextjs/
├── components/templates/visibilidad-rrhh/
│   ├── NavItem.tsx                  ✅ Elemento de menú
│   ├── Sidebar.tsx                  ✅ Barra lateral
│   ├── VisibilidadRRHHLayout.tsx    ✅ Layout completo
│   ├── index.ts                     ✅ Exports
│   ├── README.md                    ✅ Documentación
│   ├── templates-config.json        ✅ Configuración
│   └── INSTALLATION_GUIDE.md        📄 Este archivo

stores/
└── visibilidad-template-store.ts    ✅ Store Zustand
```

### 3. 🔧 Uso Básico en tu Proyecto

#### Opción A: Layout Simple
```tsx
// app/layout.tsx
import { VisibilidadRRHHLayout } from '@/components/templates/visibilidad-rrhh/VisibilidadRRHHLayout';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <VisibilidadRRHHLayout>{children}</VisibilidadRRHHLayout>
      </body>
    </html>
  );
}
```

#### Opción B: Solo Sidebar
```tsx
import { Sidebar } from '@/components/templates/visibilidad-rrhh';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

#### Opción C: NavItem Individual
```tsx
import { NavItem } from '@/components/templates/visibilidad-rrhh';
import { LayoutDashboard } from 'lucide-react';

<NavItem 
  href="/dashboard" 
  icon={LayoutDashboard} 
  label="Dashboard" 
/>
```

### 4. 🎨 Personalizar Temas

```tsx
'use client';

import { useVisibilidadTemplateStore } from '@/stores/visibilidad-template-store';

function ThemeSwitcher() {
  const { templates, activeTemplate, setActiveTemplate } = useVisibilidadTemplateStore();

  return (
    <select value={activeTemplate?.id} onChange={(e) => setActiveTemplate(e.target.value)}>
      {templates.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
```

### 5. 🎯 Plantillas Predefinidas

| Tema | ID | Descripción |
|------|----|----|
| 🔵 Default | `default-visibilidad-rrhh` | Tema estándar profesional |
| ⬛ Dark | `dark-visibilidad-rrhh` | Tema oscuro moderno |
| ⚪ Minimal | `minimal-visibilidad-rrhh` | Tema minimalista limpio |
| 🎨 Vibrant | `vibrant-visibilidad-rrhh` | Tema colorido vibrante |

## Ejemplos de Código

### Ejemplo 1: Dashboard Completo
```tsx
'use client';

import { VisibilidadRRHHLayout } from '@/components/templates/visibilidad-rrhh/VisibilidadRRHHLayout';
import { useVisibilidadTemplateStore } from '@/stores/visibilidad-template-store';
import { Bell, Settings } from 'lucide-react';

export default function Dashboard() {
  const { activeTemplate } = useVisibilidadTemplateStore();

  return (
    <VisibilidadRRHHLayout>
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className={`${activeTemplate?.sidebar.backgroundColor} rounded-lg p-6`}>
          <h2 className="text-xl font-semibold">Bienvenido al Sistema RRHH</h2>
          <p className="text-gray-600 text-sm mt-2">
            Sistema de gestión de recursos humanos para agencias japonesas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Candidatos" value="234" icon={<Bell />} />
          <StatCard title="Empleados" value="156" icon={<Bell />} />
          <StatCard title="Solicitudes" value="42" icon={<Bell />} />
        </div>
      </div>
    </VisibilidadRRHHLayout>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
}
```

### Ejemplo 2: Crear Tema Personalizado
```tsx
'use client';

import { useVisibilidadTemplateStore, VisibilidadTemplate } from '@/stores/visibilidad-template-store';

function CreateCustomTheme() {
  const { addTemplate } = useVisibilidadTemplateStore();

  const handleCreate = () => {
    const newTemplate: VisibilidadTemplate = {
      id: `custom-${Date.now()}`,
      name: 'Mi Tema Personalizado',
      description: 'Tema creado por usuario',
      colors: {
        primary: '#ff6b6b',
        secondary: '#ff5252',
        background: '#ffffff',
        text: '#2d3748',
        border: '#e2e8f0',
      },
      sidebar: {
        width: 'w-64',
        backgroundColor: 'bg-white',
        textColor: 'text-gray-700',
        activeItemBg: 'bg-red-50',
        activeItemText: 'text-red-700',
        activeItemBorder: 'border-red-600',
      },
      nav: {
        spacing: 'space-y-1',
        iconSize: 'w-5 h-5',
        fontSize: 'text-sm',
        hoverEffect: true,
      },
    };

    addTemplate(newTemplate);
    console.log('✅ Tema personalizado creado');
  };

  return <button onClick={handleCreate}>Crear Tema Personalizado</button>;
}
```

### Ejemplo 3: Tema Dinámico con API
```tsx
'use client';

import { useEffect } from 'react';
import { useVisibilidadTemplateStore } from '@/stores/visibilidad-template-store';

export function InitializeThemeFromAPI() {
  const { addTemplate } = useVisibilidadTemplateStore();

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch('/api/themes');
        const themes = await response.json();
        
        themes.forEach((theme) => {
          addTemplate(theme);
        });
      } catch (error) {
        console.error('Error cargando temas:', error);
      }
    };

    loadThemes();
  }, [addTemplate]);

  return null; // Este es un hook de inicialización
}
```

## 📊 Estructura de Template

```typescript
interface VisibilidadTemplate {
  id: string;                    // ID único
  name: string;                  // Nombre visible
  description: string;           // Descripción
  colors: {
    primary: string;             // Color primario (hex)
    secondary: string;           // Color secundario
    background: string;          // Color fondo
    text: string;               // Color texto
    border: string;             // Color bordes
  };
  sidebar: {
    width: string;              // Ancho (Tailwind class)
    backgroundColor: string;    // Fondo sidebar
    textColor: string;         // Texto sidebar
    activeItemBg: string;      // Fondo item activo
    activeItemText: string;    // Texto item activo
    activeItemBorder: string;  // Borde item activo
  };
  nav: {
    spacing: string;           // Espaciado entre items
    iconSize: string;         // Tamaño de iconos
    fontSize: string;        // Tamaño de fuente
    hoverEffect: boolean;    // Efecto hover
  };
}
```

## 🔍 Store: Métodos Disponibles

```typescript
const store = useVisibilidadTemplateStore();

// Leer
store.templates              // Array de templates
store.activeTemplate         // Template activo
store.getDefaultTemplate()   // Obtener default

// Escribir
store.addTemplate(template)           // Agregar
store.updateTemplate(id, updates)     // Actualizar
store.deleteTemplate(id)              // Eliminar
store.setActiveTemplate(id)           // Cambiar activo
```

## 🐛 Troubleshooting

### ❌ "Cannot find module 'lucide-react'"
**Solución:**
```bash
npm install lucide-react
npm run build
```

### ❌ "Estilos no se aplican"
**Verificar:**
1. Tailwind CSS está configurado en `tailwind.config.ts`
2. Las rutas de contenido incluyen componentes:
```ts
content: [
  './components/**/*.{js,ts,jsx,tsx}',
  './app/**/*.{js,ts,jsx,tsx}',
]
```

### ❌ "Active state no funciona"
**Usar:**
```tsx
// ✅ Correcto (App Router)
import { usePathname } from 'next/navigation';
const pathname = usePathname();

// ❌ Incorrecto (Pages Router)
import { useRouter } from 'next/router';
const router = useRouter();
```

### ❌ "Temas no persisten"
**Verificar localStorage:**
```js
// Comprobar en DevTools Console
localStorage.getItem('visibilidad-template-store')
// Debería mostrar JSON del store
```

## 📚 Referencias

- 📖 [Lucide React Icons](https://lucide.dev/)
- 📖 [Zustand Store](https://docs.pmnd.rs/zustand/)
- 📖 [Tailwind CSS](https://tailwindcss.com/)
- 📖 [Next.js App Router](https://nextjs.org/docs/app)

## ✅ Checklist de Integración

- [ ] Dependencias instaladas (`lucide-react`, `zustand`)
- [ ] Archivos en `frontend-nextjs/components/templates/visibilidad-rrhh/`
- [ ] Store en `frontend-nextjs/stores/visibilidad-template-store.ts`
- [ ] Importar `VisibilidadRRHHLayout` en layout principal
- [ ] Probar navegación con links activos
- [ ] Probar cambio de temas con store
- [ ] Persistencia localStorage verificada
- [ ] Build y test en producción

## 🎓 Próximos Pasos

1. **Integrar en Layout Principal**
   ```bash
   cp -r components/templates/visibilidad-rrhh app/layout.tsx
   ```

2. **Crear Página de Selector de Temas**
   ```tsx
   // app/(dashboard)/themes/page.tsx
   import { ThemeSwitcher } from '@/components/theme-switcher';
   ```

3. **API de Temas (Opcional)**
   ```bash
   # Crear endpoint en backend
   POST /api/themes
   GET /api/themes
   PUT /api/themes/:id
   DELETE /api/themes/:id
   ```

---

**Versión:** 1.0.0  
**Última Actualización:** 2025-10-26  
**Estado:** ✅ Completado y Listo para Usar
