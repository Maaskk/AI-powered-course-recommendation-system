"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Star, ExternalLink, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Course {
  item_id: string
  title: string
  description?: string
  url?: string
  predicted_rating: number
  avg_rating: number
  num_ratings: number
  confidence: number
  category?: string
  difficulty?: string
}

interface RecommendationGeneratorProps {
  userId: string
}

export function RecommendationGenerator({ userId }: RecommendationGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [error, setError] = useState("")
  const [hasGenerated, setHasGenerated] = useState(false)

  const generateRecommendations = async () => {
    setLoading(true)
    setError("")
    setProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 300)

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, top_n: 10 }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate recommendations")
      }

      setRecommendations(data.recommendations || [])
      setHasGenerated(true)

      if (data.recommendations?.length > 0) {
        toast.success(`Found ${data.recommendations.length} personalized courses!`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate recommendations")
      console.error(err)
      toast.error("Failed to generate recommendations")
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      {!hasGenerated && !loading && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-8 md:p-12 text-center">
          <div className="inline-flex p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Ready to discover your perfect courses?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Our AI will analyze thousands of courses to find the best matches for your major and interests.
          </p>
          <Button onClick={generateRecommendations} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Sparkles className="mr-2 h-5 w-5" />
            Generate My Recommendations
          </Button>
        </div>
      )}

      {/* Loading State with Progress */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 md:p-12 text-center">
          <div className="space-y-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
              <div className="relative p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                AI is analyzing courses for you...
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Matching your profile with thousands of courses
              </p>
              <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{progress}% complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">
                Couldn't generate recommendations
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={generateRecommendations} className="border-red-200 dark:border-red-800">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {recommendations.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                Your Personalized Recommendations
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Based on your profile and interests
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={generateRecommendations} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.map((course, index) => {
              const confidencePct = Math.round((course.confidence || 0) * 100)
              const confidenceColor =
                confidencePct >= 80
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : confidencePct >= 60
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"

              const courseId = course.item_id || course.course_id || String(course.title).toLowerCase().replace(/\s+/g, "-")
              
              return (
                <Link
                  key={course.item_id || course.course_id || index}
                  href={`/course/${encodeURIComponent(courseId)}`}
                  className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-2 flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${confidenceColor}`}>
                      {confidencePct}% match
                    </span>
                  </div>

                  {course.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">
                          {(course.avg_rating || course.predicted_rating || 0).toFixed(1)}
                        </span>
                      </span>
                      {course.category && (
                        <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {course.category}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {hasGenerated && recommendations.length === 0 && !loading && !error && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No recommendations found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            We couldn't find matching courses. Try updating your profile or check back later.
          </p>
          <Button variant="outline" size="sm" onClick={generateRecommendations}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
