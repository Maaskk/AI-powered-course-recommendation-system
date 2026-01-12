"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: "h-5 w-5", container: "h-8 w-8", text: "text-lg" },
    md: { icon: "h-6 w-6", container: "h-10 w-10", text: "text-xl" },
    lg: { icon: "h-8 w-8", container: "h-14 w-14", text: "text-2xl" },
  }

  return (
    <Link href="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
      <div className={`${sizes[size].container} rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center`} suppressHydrationWarning>
        <BookOpen className={`${sizes[size].icon} text-white dark:text-slate-900`} suppressHydrationWarning />
      </div>
      {showText && (
        <span className={`font-semibold ${sizes[size].text} text-slate-900 dark:text-white`}>
          LearnPath
        </span>
      )}
    </Link>
  )
}
