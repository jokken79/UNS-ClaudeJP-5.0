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
      borderRadius: 'var(--layout-card-radius, 1.25rem)',
      boxShadow: 'var(--layout-card-shadow, 0 10px 40px rgba(0, 0, 0, 0.08))',
      borderColor: 'var(--layout-card-border, rgba(203, 213, 225, 0.5))',
      background: 'var(--layout-card-surface, linear-gradient(to bottom right, #ffffff, #fafafa))',
      backdropFilter: 'blur(calc(var(--layout-panel-blur, 18px) * 0.35))',
      ...style,
    }

    if (!shouldAnimate) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden border-2 text-card-foreground transition-all duration-500 backdrop-blur-sm",
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
          "relative overflow-hidden border-2 text-card-foreground transition-all duration-500 backdrop-blur-sm",
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
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
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
    className={cn("text-xl font-bold leading-tight tracking-tight text-gray-900", className)}
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
    className={cn("text-sm text-gray-600 leading-relaxed", className)}
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
    className={cn("flex items-center gap-3 p-6 pt-4 border-t border-gray-100", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
