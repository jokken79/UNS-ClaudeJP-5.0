'use client';

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { shouldReduceMotion } from "@/lib/animations"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable hover animation
   */
  enableHover?: boolean
  /**
   * Disable animations
   */
  disableAnimations?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, style, enableHover = false, disableAnimations = false, ...props }, ref) => {
    const reducedMotion = shouldReduceMotion()
    const shouldAnimate = enableHover && !disableAnimations && !reducedMotion

    const baseStyle = {
      borderRadius: 'var(--layout-card-radius, 1rem)',
      boxShadow: 'var(--layout-card-shadow, 0 20px 45px rgba(15, 23, 42, 0.12))',
      borderColor: 'var(--layout-card-border, rgba(148, 163, 184, 0.25))',
      background: 'var(--layout-card-surface, hsl(var(--card)))',
      backdropFilter: 'blur(calc(var(--layout-panel-blur, 18px) * 0.35))',
      ...style,
    }

    if (!shouldAnimate) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden border text-card-foreground shadow transition-all duration-500",
            className
          )}
          style={baseStyle}
          {...props}
        />
      )
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden border text-card-foreground shadow transition-all duration-500",
          className
        )}
        style={baseStyle}
        whileHover={{
          y: -4,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
