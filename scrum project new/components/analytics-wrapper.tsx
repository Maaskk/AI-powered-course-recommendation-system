'use client'

import { Analytics } from "@vercel/analytics/next"
import { useEffect, useState } from "react"

export function AnalyticsWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <Analytics />
}
