'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { fadeInUp, getVariants, shouldReduceMotion } from '@/lib/animations';
import { AnimatedCounter } from '@/components/ui/animated';
import { useEffect, useState } from 'react';

export type MetricCardVariant = 'default' | 'large' | 'compact' | 'featured';
export type MetricCardTheme = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  loading?: boolean;
  variant?: MetricCardVariant;
  theme?: MetricCardTheme;
  sparkline?: { value: number }[];
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  loading = false,
  variant = 'default',
  theme = 'default',
  sparkline,
}: MetricCardProps) {
  const reducedMotion = shouldReduceMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme colors
  const themeConfig = {
    default: {
      gradient: 'from-background to-background',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      ring: 'ring-primary/5',
    },
    success: {
      gradient: 'from-emerald-50/50 to-background dark:from-emerald-950/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-500/5',
    },
    warning: {
      gradient: 'from-amber-50/50 to-background dark:from-amber-950/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-500/5',
    },
    danger: {
      gradient: 'from-red-50/50 to-background dark:from-red-950/20',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500/5',
    },
    info: {
      gradient: 'from-blue-50/50 to-background dark:from-blue-950/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-500/5',
    },
  };

  const currentTheme = themeConfig[theme];

  // Variant styles
  const variantStyles = {
    default: {
      iconSize: 'h-10 w-10',
      iconInner: 'h-5 w-5',
      valueSize: 'text-3xl',
      titleSize: 'text-sm',
      padding: 'p-6',
    },
    large: {
      iconSize: 'h-14 w-14',
      iconInner: 'h-7 w-7',
      valueSize: 'text-4xl',
      titleSize: 'text-base',
      padding: 'p-8',
    },
    compact: {
      iconSize: 'h-8 w-8',
      iconInner: 'h-4 w-4',
      valueSize: 'text-2xl',
      titleSize: 'text-xs',
      padding: 'p-4',
    },
    featured: {
      iconSize: 'h-12 w-12',
      iconInner: 'h-6 w-6',
      valueSize: 'text-4xl',
      titleSize: 'text-sm',
      padding: 'p-6',
    },
  };

  const currentVariant = variantStyles[variant];

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-10 w-10 bg-muted rounded-full"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted rounded mb-2"></div>
          <div className="h-3 w-32 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Parse numeric value for counter animation
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  const isNumeric = !isNaN(numericValue);
  const valueString = typeof value === 'string' ? value : String(value);

  const cardContent = (
    <>
      <CardHeader className={cn("flex flex-row items-center justify-between pb-2", currentVariant.padding)}>
        <CardTitle className={cn("font-medium text-muted-foreground", currentVariant.titleSize)}>
          {title}
        </CardTitle>
        <motion.div
          className={cn(
            "rounded-full flex items-center justify-center ring-4",
            currentVariant.iconSize,
            currentTheme.iconBg,
            currentTheme.ring
          )}
          initial={!reducedMotion ? { scale: 0, rotate: -180 } : undefined}
          animate={!reducedMotion ? { scale: 1, rotate: 0 } : undefined}
          transition={!reducedMotion ? { type: 'spring', stiffness: 200, damping: 15, delay: 0.1 } : undefined}
        >
          <Icon className={cn(currentVariant.iconInner, currentTheme.iconColor)} />
        </motion.div>
      </CardHeader>
      <CardContent className={currentVariant.padding}>
        <div className="space-y-2">
          <div className={cn("font-bold tracking-tight", currentVariant.valueSize)}>
            {mounted && isNumeric && !reducedMotion ? (
              <AnimatedCounter value={numericValue} duration={1.2} />
            ) : (
              valueString
            )}
          </div>

          {description && (
            <motion.p
              className="text-xs text-muted-foreground"
              initial={!reducedMotion ? { opacity: 0, y: 10 } : undefined}
              animate={!reducedMotion ? { opacity: 1, y: 0 } : undefined}
              transition={!reducedMotion ? { delay: 0.3 } : undefined}
            >
              {description}
            </motion.p>
          )}

          {trend && (
            <motion.div
              className="flex items-center gap-2 pt-1"
              initial={!reducedMotion ? { opacity: 0, x: -10 } : undefined}
              animate={!reducedMotion ? { opacity: 1, x: 0 } : undefined}
              transition={!reducedMotion ? { delay: 0.4 } : undefined}
            >
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950'
                    : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {trend.label || 'vs mes anterior'}
              </span>
            </motion.div>
          )}

          {/* Sparkline mini chart */}
          {sparkline && sparkline.length > 0 && (
            <motion.div
              className="h-12 w-full mt-4 -mb-2"
              initial={!reducedMotion ? { opacity: 0, scaleY: 0 } : undefined}
              animate={!reducedMotion ? { opacity: 1, scaleY: 1 } : undefined}
              transition={!reducedMotion ? { delay: 0.5 } : undefined}
            >
              {/* Simple SVG sparkline */}
              <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={currentTheme.iconColor}
                  points={sparkline.map((point, i) => {
                    const x = (i / (sparkline.length - 1)) * 100;
                    const maxValue = Math.max(...sparkline.map(p => p.value));
                    const y = 30 - (point.value / maxValue) * 25;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </svg>
            </motion.div>
          )}
        </div>
      </CardContent>
    </>
  );

  if (reducedMotion) {
    return (
      <Card
        className={cn(
          'transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer overflow-hidden',
          variant === 'featured' && `bg-gradient-to-br ${currentTheme.gradient}`,
          className
        )}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={getVariants(fadeInUp)}
      whileHover={{
        y: variant === 'large' ? -8 : -6,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn('cursor-pointer', className)}
    >
      <Card className={cn(
        'h-full overflow-hidden',
        variant === 'featured' && `bg-gradient-to-br ${currentTheme.gradient}`
      )}>
        {cardContent}
      </Card>
    </motion.div>
  );
}

// Variant for small metric cards
export function MetricCardSmall({
  title,
  value,
  icon: Icon,
  className,
}: Omit<MetricCardProps, 'description' | 'trend'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-md',
        className
      )}
    >
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}
