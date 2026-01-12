"use client"

import { Card } from "@/components/ui/card"
import { Star, ExternalLink, TrendingUp } from "lucide-react"
import { ClientIcon } from "@/components/client-icon"
import Link from "next/link"

interface CourseCardProps {
  course: {
    item_id?: string
    course_id?: string
    title: string
    description?: string
    category?: string
    difficulty?: string
    rating: number
    predicted_rating?: number
    confidence?: number
    source?: string
    url?: string
    num_ratings?: number
    avg_rating?: number
  }
  userRating?: number
  onRate?: (rating: number) => void
}

export function CourseCard({ course, userRating, onRate }: CourseCardProps) {
  const courseId = course.item_id || course.course_id || ""
  const confidence = course.confidence || 0
  const confidencePct = Math.round(confidence * 100)

  const confidenceColor =
    confidencePct >= 80
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : confidencePct >= 60
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"

  return (
    <Link href={`/course/${courseId}`} className="block">
      <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden cursor-pointer h-full">
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
              {course.title}
            </h3>
            <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${confidenceColor}`}>
              {confidencePct}%
            </span>
          </div>

          {course.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
              {course.description}
            </p>
          )}

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {course.category && (
              <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {course.category}
              </span>
            )}
            {course.difficulty && (
              <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {course.difficulty}
              </span>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-500">{course.source || "Coursera"}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <ClientIcon icon={Star} className="h-4 w-4 fill-amber-400 text-amber-400" suppressHydrationWarning />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {(course.avg_rating || course.rating || 0).toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({course.num_ratings || 0} reviews)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline transition-colors">
                View Details →
              </span>
              {course.url && course.url !== "#" && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <ClientIcon icon={ExternalLink} className="h-4 w-4" suppressHydrationWarning />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
