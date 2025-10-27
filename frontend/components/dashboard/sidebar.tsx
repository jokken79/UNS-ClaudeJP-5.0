'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { dashboardConfig } from '@/lib/constants/dashboard-config';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
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
        'h-screen border-r bg-background flex-shrink-0',
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
      <div className="flex h-16 items-center justify-between px-4 border-b">
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
          <div className={cn('px-3 py-3 border-b bg-muted/30', collapsed && 'px-2')}>
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
        <nav className="flex flex-col gap-2 p-2">
          {/* Navegación Principal */}
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.h4
                  key="main-nav-title"
                  className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
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
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3 h-10 transition-all relative overflow-hidden',
                          collapsed && 'justify-center px-2',
                          isActive && 'bg-primary/10 text-primary font-medium hover:bg-primary/20 border-l-2 border-primary'
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        <motion.div
                          animate={!reducedMotion && isActive ? { scale: [1, 1.2, 1] } : undefined}
                          transition={!reducedMotion && isActive ? { duration: 0.3 } : undefined}
                        >
                          <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
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
                            className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l"
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

          <Separator className="my-2" />

          {/* Navegación Secundaria */}
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.h4
                  key="secondary-nav-title"
                  className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
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
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3 h-10 transition-all',
                        collapsed && 'justify-center px-2',
                        isActive && 'text-primary font-medium'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className="h-5 w-5" />
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
                <div className="px-3 py-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">
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
