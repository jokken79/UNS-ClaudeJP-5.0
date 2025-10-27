'use client';

/**
 * Ejemplo de uso completo de la plantilla Visibilidad RRHH
 * con Store personalizado y layout integrado
 */

import { Sidebar } from './Sidebar';
import { useVisibilidadTemplateStore } from '@/stores/visibilidad-template-store';
import { useEffect, useState } from 'react';

export const VisibilidadRRHHLayout = ({ children }: { children: React.ReactNode }) => {
  const { activeTemplate, getDefaultTemplate } = useVisibilidadTemplateStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex">Loading...</div>;
  }

  const template = activeTemplate || getDefaultTemplate();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {template.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {template.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                Template: {template.id}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4 text-xs text-gray-500">
          <p>© 2025 Sistema de RRHH para agencias japonesas. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default VisibilidadRRHHLayout;
