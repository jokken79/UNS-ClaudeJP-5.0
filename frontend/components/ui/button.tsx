'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { buttonHover, buttonTap, shouldReduceMotion } from "@/lib/animations"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 hover:scale-105 active:scale-100 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        destructive:
          "bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 hover:scale-105 active:scale-100",
        outline:
          "border-2 border-gray-300 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:border-gray-400 shadow-md hover:shadow-lg hover:scale-105 active:scale-100",
        secondary:
          "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 text-white shadow-lg shadow-gray-500/50 hover:shadow-xl hover:shadow-gray-500/60 hover:scale-105 active:scale-100",
        ghost: "hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 hover:shadow-md",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 font-semibold",
        success:
          "bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 hover:scale-105 active:scale-100",
        warning:
          "bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/60 hover:scale-105 active:scale-100",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Disable animations (for reduced motion or performance)
   */
  disableAnimations?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disableAnimations = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const reducedMotion = shouldReduceMotion()
    const shouldAnimate = !disableAnimations && !reducedMotion

    // If using asChild or animations disabled, use original component
    if (asChild || !shouldAnimate) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      )
    }

    // Use motion.button for animations
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={buttonHover}
        whileTap={buttonTap}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
