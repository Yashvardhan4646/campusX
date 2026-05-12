"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

/**
 * Reusable Logo component for CampusZen.
 * @param {Object} props
 * @param {string} props.className - Additional classes for the container
 * @param {boolean} props.showText - Whether to show the "CampusZen" text
 * @param {string} props.size - Size of the icon ('sm', 'md', 'lg')
 * @param {string} props.href - Destination link (defaults to /feed)
 */
export default function Logo({ 
  className, 
  showText = true, 
  size = "md", 
  href = "/" 
}) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <Link 
      href={href} 
      className={cn("flex items-center gap-3 group transition-all duration-300", className)}
    >
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex items-center justify-center",
          iconSizes[size] || iconSizes.md
        )}
      >
        {/* Modern Abstract Logo Shape */}
        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/40 transition-all duration-500" />
        <div className="relative w-full h-full bg-gradient-to-br from-primary to-brand rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.4),transparent_50%)]" />
          <span className="text-white font-black italic tracking-tighter select-none">CZ</span>
        </div>
      </motion.div>
      {showText && (
        <span className={cn(
          "font-black tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary",
          textSizes[size] || textSizes.md
        )}>
          Campus<span className="text-primary group-hover:text-foreground transition-colors duration-300">Zen</span>
        </span>
      )}
    </Link>
  )
}
