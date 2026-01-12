'use client'

import { type LucideIcon } from 'lucide-react'

interface ClientIconProps {
  icon: LucideIcon
  className?: string
}

export function ClientIcon({ icon: Icon, className }: ClientIconProps) {
  return <Icon className={className} suppressHydrationWarning />
}
