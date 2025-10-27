'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { dashboardConfig } from '@/lib/constants/dashboard-config';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useSidebar } from '@/lib/hooks/use-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInLeft, staggerFast, shouldReduceMotion } from '@/lib/animations';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const reducedMotion = shouldReduceMotion();
  const { user } = useAuthStore();
  const { visibilityEnabled, updateVisibilityToggle, fetchVisibilityToggle } = useSettingsStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch visibility toggle on mount
  useEffect(() => {
    fetchVisibilityToggle();
  }, [fetchVisibilityToggle]);

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Handle toggle change
  const handleVisibilityToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await updateVisibilityToggle(checked);
    } catch (error) {
      console.error('Failed to update visibility toggle:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.aside
      className={cn(
        'h-screen flex-shrink-0 bg-gradient-to-b from-indigo-50 via-white to-slate-100 border-r border-indigo-100/60',
        'shadow-[inset_-1px_0_0_rgba(148,163,184,0.2)] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:border-slate-800/80 dark:shadow-[inset_-1px_0_0_rgba(15,23,42,0.6)]',
        'transition-all duration-300 ease-in-out'
      )}
      animate={{
        width: collapsed ? '4rem' : '16rem',
      }}
      transition={
        !reducedMotion
          ? { type: 'spring', stiffness: 300, damping: 30 }
          : { duration: 0.3 }
      }
    >
      {/* Header del Sidebar */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-indigo-100/60 bg-white/70 backdrop-blur-sm dark:bg-slate-950/60 dark:border-slate-800/80">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo"
              initial={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
              animate={!reducedMotion ? { opacity: 1, x: 0 } : undefined}
              exit={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
              transition={!reducedMotion ? { duration: 0.2 } : undefined}
            >
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <motion.div
                  className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
                  whileHover={!reducedMotion ? { rotate: [0, -10, 10, 0] } : undefined}
                  transition={!reducedMotion ? { duration: 0.5 } : undefined}
                >
                  <span className="text-white font-bold text-lg">U</span>
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">UNS HRApp</span>
                  <span className="text-xs text-muted-foreground">v4.2</span>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{ x: collapsed ? 0 : undefined }}
          className={cn(collapsed && 'mx-auto')}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 hover:bg-accent"
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={!reducedMotion ? { duration: 0.3 } : undefined}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Admin Visibility Toggle */}
      {isAdmin && (
        <>
          <div
            className={cn(
              'px-3 py-3 border-b border-indigo-100/60 bg-white/60 shadow-sm dark:bg-slate-950/40 dark:border-slate-800/80',
              collapsed && 'px-2'
            )}
          >
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="toggle-full"
                  className="flex items-center justify-between gap-3"
                  initial={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
                  animate={!reducedMotion ? { opacity: 1, x: 0 } : undefined}
                  exit={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
                  transition={!reducedMotion ? { duration: 0.2 } : undefined}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {visibilityEnabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        Visibilidad
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {visibilityEnabled ? 'Contenido visible' : 'En construcción'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={visibilityEnabled}
                    onCheckedChange={handleVisibilityToggle}
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-green-600"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="toggle-collapsed"
                  className="flex justify-center"
                  initial={!reducedMotion ? { opacity: 0 } : undefined}
                  animate={!reducedMotion ? { opacity: 1 } : undefined}
                  exit={!reducedMotion ? { opacity: 0 } : undefined}
                  transition={!reducedMotion ? { duration: 0.2 } : undefined}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title={visibilityEnabled ? 'Contenido visible' : 'En construcción'}
                  >
                    {visibilityEnabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-red-600" />
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Navegación */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="flex flex-col gap-3 p-3">
          {/* Navegación Principal */}
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.h4
                  key="main-nav-title"
                  className="px-4 mb-2 text-[11px] font-semibold tracking-[0.2em] text-indigo-400/80 dark:text-indigo-300/60 uppercase"
                  initial={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
                  animate={!reducedMotion ? { opacity: 1, x: 0 } : undefined}
                  exit={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
                  transition={!reducedMotion ? { duration: 0.2 } : undefined}
                >
                  Principal
                </motion.h4>
              )}
            </AnimatePresence>
            {dashboardConfig.mainNav.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <motion.div
                  key={item.href}
                  initial={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
                  animate={!reducedMotion ? { opacity: 1, x: 0 } : undefined}
                  transition={!reducedMotion ? { delay: index * 0.05 } : undefined}
                >
                  <Link href={item.href}>
                    <motion.div
                      whileHover={!reducedMotion ? { scale: 1.02, x: 4 } : undefined}
                      whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
                      transition={!reducedMotion ? { type: 'spring', stiffness: 400, damping: 25 } : undefined}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-3 h-11 rounded-xl transition-all relative overflow-hidden bg-white/30 text-slate-600 hover:!bg-white/70 hover:text-slate-700 hover:shadow-lg hover:border-indigo-100',
                          'border border-transparent backdrop-blur-sm dark:bg-slate-900/40 dark:text-slate-200 dark:hover:!bg-slate-900/70 dark:hover:text-white/90',
                          collapsed && 'justify-center px-2 rounded-full',
                          isActive &&
                            'bg-white text-indigo-600 shadow-md shadow-indigo-200/60 ring-1 ring-indigo-200/80 hover:!bg-white hover:text-indigo-600 dark:bg-slate-900 dark:text-indigo-300 dark:ring-indigo-500/50 dark:shadow-indigo-900/30'
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        <motion.div
                          animate={!reducedMotion && isActive ? { scale: [1, 1.2, 1] } : undefined}
                          transition={!reducedMotion && isActive ? { duration: 0.3 } : undefined}
                        >
                          <Icon className={cn('h-5 w-5 text-slate-400', isActive && 'text-indigo-500 dark:text-indigo-300')} />
                        </motion.div>
                        <AnimatePresence mode="wait">
                          {!collapsed && (
                            <motion.span
                              key="nav-text"
                              className="text-sm truncate"
                              initial={!reducedMotion ? { opacity: 0, width: 0 } : undefined}
                              animate={!reducedMotion ? { opacity: 1, width: 'auto' } : undefined}
                              exit={!reducedMotion ? { opacity: 0, width: 0 } : undefined}
                              transition={!reducedMotion ? { duration: 0.2 } : undefined}
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* Active indicator line */}
                        {isActive && (
                          <motion.div
                            className="absolute right-1 top-1 bottom-1 w-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-indigo-600 dark:from-indigo-500 dark:to-indigo-400"
                            layoutId="activeIndicator"
                            transition={!reducedMotion ? { type: 'spring', stiffness: 300, damping: 30 } : undefined}
                          />
                        )}
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <Separator className="my-3 bg-indigo-100/60 dark:bg-slate-800/80" />

          {/* Navegación Secundaria */}
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.h4
                  key="secondary-nav-title"
                  className="px-4 mb-2 text-[11px] font-semibold tracking-[0.2em] text-indigo-400/80 dark:text-indigo-300/60 uppercase"
                  initial={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
                  animate={!reducedMotion ? { opacity: 1, x: 0 } : undefined}
                  exit={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
                  transition={!reducedMotion ? { duration: 0.2 } : undefined}
                >
                  Otros
                </motion.h4>
              )}
            </AnimatePresence>
            {dashboardConfig.secondaryNav.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <motion.div
                  key={item.href}
                  initial={!reducedMotion ? { opacity: 0, x: -20 } : undefined}
                  animate={!reducedMotion ? { opacity: 1, x: 0 } : undefined}
                  transition={!reducedMotion ? { delay: index * 0.05 } : undefined}
                >
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 h-11 rounded-xl transition-all bg-white/20 text-slate-500 hover:!bg-white/60 hover:text-slate-700 hover:shadow-md',
                        'border border-transparent backdrop-blur-sm dark:bg-slate-900/30 dark:text-slate-300 dark:hover:!bg-slate-900/60',
                        collapsed && 'justify-center px-2 rounded-full',
                        isActive &&
                          'bg-white text-indigo-600 shadow-md shadow-indigo-200/40 ring-1 ring-indigo-200/70 hover:!bg-white hover:text-indigo-600 dark:bg-slate-900 dark:text-indigo-300 dark:ring-indigo-500/40'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className="h-5 w-5 text-slate-400" />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            key="nav-text"
                            className="text-sm truncate"
                            initial={!reducedMotion ? { opacity: 0, width: 0 } : undefined}
                            animate={!reducedMotion ? { opacity: 1, width: 'auto' } : undefined}
                            exit={!reducedMotion ? { opacity: 0, width: 0 } : undefined}
                            transition={!reducedMotion ? { duration: 0.2 } : undefined}
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Footer del Sidebar */}
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="sidebar-footer"
                className="mt-auto pt-4 pb-2"
                initial={!reducedMotion ? { opacity: 0, y: 20 } : undefined}
                animate={!reducedMotion ? { opacity: 1, y: 0 } : undefined}
                exit={!reducedMotion ? { opacity: 0, y: 20 } : undefined}
                transition={!reducedMotion ? { duration: 0.2 } : undefined}
              >
                <div className="px-3 py-2 rounded-xl bg-white/40 shadow-sm backdrop-blur-sm dark:bg-slate-900/40">
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    Sistema de RRHH para agencias japonesas
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </ScrollArea>
    </motion.aside>
  );
}
