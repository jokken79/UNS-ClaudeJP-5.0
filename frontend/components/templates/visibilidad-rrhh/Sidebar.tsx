'use client';

import NavItem from './NavItem';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  Settings,
  HelpCircle,
  Briefcase,
  File,
} from 'lucide-react';

interface NavGroup {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: any;
  }>;
}

const navGroups: NavGroup[] = [
  {
    title: 'PRINCIPAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/candidatos', label: 'Candidatos', icon: Users },
      { href: '/empleados', label: 'Empleados', icon: Briefcase },
      { href: '/fabricas', label: 'Fábricas', icon: Briefcase },
    ],
  },
  {
    title: 'TIEMPO Y NÓMINA',
    items: [
      { href: '/asistencia', label: 'Asistencia', icon: Clock },
      { href: '/nomina', label: 'Nómina', icon: FileText },
      { href: '/solicitudes', label: 'Solicitudes', icon: File },
    ],
  },
  {
    title: 'OTROS',
    items: [
      { href: '/base-datos', label: 'Base de Datos DD', icon: File },
      { href: '/reportes', label: 'Reportes', icon: FileText },
      { href: '/configuracion', label: 'Configuración', icon: Settings },
      { href: '/ayuda', label: 'Ayuda', icon: HelpCircle },
    ],
  },
];

export const Sidebar = () => {
  return (
    <div className="w-64 flex flex-col bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Logo/Título de la App */}
      <div className="p-4 text-xl font-bold text-gray-800 border-b border-gray-100">
        Visibilidad RRHH
      </div>

      {/* Contenedor del Menú */}
      <nav className="flex-grow p-2 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title}>
            {/* Título de la Sección (PRINCIPAL, OTROS, etc.) */}
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mt-4 mb-2">
              {group.title}
            </h3>

            {/* Lista de Enlaces */}
            <div className="flex flex-col space-y-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Pie de página del Sidebar (Sistema de RRHH) */}
      <div className="p-4 text-xs text-gray-400 border-t border-gray-100 text-center">
        Sistema de RRHH para agencias japonesas
      </div>
    </div>
  );
};

export default Sidebar;
