"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { RecommendationGenerator } from "@/components/recommendation-generator"
import type { AuthUser } from "@/lib/auth"
import { LogOut, Star, AlertCircle, Settings, BookOpen, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { ClientIcon } from "@/components/client-icon"

interface DashboardClientProps {
  user: AuthUser
}

interface PopularItem {
  item_id: string
  title: string
  description?: string
  url?: string
  avg_rating: number
  num_ratings: number
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"recommendations" | "popular">("recommendations")
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [health, setHealth] = useState<any>(null)

  useEffect(() => {
    checkHealth()
    loadPopularItems()
  }, [])

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error("Health check failed:", error)
    }
  }

  const loadPopularItems = async () => {
    try {
      const response = await fetch("/api/popular?limit=12")
      const data = await response.json()
      if (Array.isArray(data)) {
        setPopularItems(data)
      } else if (data && Array.isArray(data.items)) {
        setPopularItems(data.items)
      } else {
        setPopularItems([])
      }
    } catch (error) {
      console.error("Error loading popular items:", error)
      setPopularItems([])
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast.success("Logged out")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ClientIcon icon={Settings} className="h-4 w-4" suppressHydrationWarning />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <ClientIcon icon={LogOut} className="h-4 w-4" suppressHydrationWarning />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Warning */}
      {health && health.ml_api === "disconnected" && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900">
          <div className="container mx-auto px-4 md:px-6 py-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <ClientIcon icon={AlertCircle} className="h-4 w-4" suppressHydrationWarning />
            <span>ML API offline. Start it on port 5000 for recommendations.</span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {user.major && user.year ? `${user.major} • Year ${user.year}` : "Ready to discover new courses?"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <ClientIcon icon={BookOpen} className="h-6 w-6 text-blue-600 dark:text-blue-400" suppressHydrationWarning />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Available Courses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{popularItems.length}+</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <ClientIcon icon={Star} className="h-6 w-6 text-purple-600 dark:text-purple-400" suppressHydrationWarning />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your Major</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{user.major || "Not set"}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <ClientIcon icon={TrendingUp} className="h-6 w-6 text-green-600 dark:text-green-400" suppressHydrationWarning />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Match Accuracy</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">94%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "recommendations"
                ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "popular"
                ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Popular
          </button>
        </div>

        {/* Content */}
        {activeTab === "recommendations" && <RecommendationGenerator userId={user.user_id} />}

        {activeTab === "popular" && (
          <div className="space-y-6">
            {popularItems.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
                <ClientIcon icon={TrendingUp} className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" suppressHydrationWarning />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No popular courses available</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Make sure the ML API is running to see popular courses.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <ClientIcon icon={Star} className="h-4 w-4 fill-amber-400 text-amber-400" suppressHydrationWarning />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.avg_rating?.toFixed(1) || "N/A"}
                        </span>
                        <span className="text-slate-400">({item.num_ratings || 0})</span>
                      </div>
                      {item.url && (
                        <Link
                          href={`/course/${item.item_id}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
