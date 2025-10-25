# UNS-ClaudeJP 5.0 - HR Management System

Dashboard de gestión de recursos humanos para agencias de empleo japonesas, construido con Next.js 16.0.0, React 19.0.0 y TypeScript 5.6.0.

> 🚀 **Nueva versión 5.0** - Actualizado con Next.js 16, React 19 y Turbopack como bundler por defecto.

## Características

- Next.js 16.0.0 con App Router
- React 19.0.0 y React DOM 19.0.0
- TypeScript 5.6.0
- Turbopack (bundler por defecto - 70% más rápido)
- Tailwind CSS 3.4.18
- Radix UI Components
- Recharts para visualización de datos
- Zustand para gestión de estado
- React Hook Form para formularios

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/nextjs-dashboard.git
   cd nextjs-dashboard
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Copia el archivo de variables de entorno:
   ```bash
   cp .env.local.example .env.local
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## Scripts

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint
- `npm run type-check` - Verifica los tipos de TypeScript

## Estructura del Proyecto

```
nextjs-dashboard/
├── app/                 # Directorio de la aplicación Next.js
├── components/           # Componentes de React
├── lib/                 # Utilidades y configuraciones
├── public/              # Archivos estáticos
├── styles/              # Archivos de estilo
├── .env.local.example    # Ejemplo de variables de entorno
├── .eslintrc.json       # Configuración de ESLint
├── next.config.js       # Configuración de Next.js
├── package.json         # Dependencias y scripts
├── postcss.config.js    # Configuración de PostCSS
├── tailwind.config.js   # Configuración de Tailwind CSS
└── tsconfig.json        # Configuración de TypeScript
```

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request