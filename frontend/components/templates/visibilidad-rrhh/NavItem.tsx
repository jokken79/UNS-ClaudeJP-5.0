'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const NavItem = ({ href, icon: Icon, label }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  // Define los estilos condicionalmente
  const activeClass =
    'bg-blue-50 text-blue-700 border-l-4 border-blue-600';
  const inactiveClass =
    'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent';

  return (
    <Link
      href={href}
      className={`
        flex items-center space-x-3 p-3 text-sm font-medium transition-all duration-150 ease-in-out
        ${isActive ? activeClass : inactiveClass}
      `}
    >
      {/* Icono */}
      {Icon && <Icon className="w-5 h-5" />}

      {/* Etiqueta */}
      <span>{label}</span>
    </Link>
  );
};

export default NavItem;
