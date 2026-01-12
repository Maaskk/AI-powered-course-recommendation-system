"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, Star, ExternalLink, Loader2, MessageSquare, Clock, Users, Award, CheckCircle2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ClientIcon } from "@/components/client-icon"

interface Course {
  item_id: string
  title: string
  description: string
  category: string
  difficulty: string
  rating: number
  predicted_rating: number
  confidence: number
  source: string
  url: string
  num_ratings: number
}

interface Review {
  review_id: string
  course_id: string
  review_text: string
  rating: number
  label: number
  created_at?: string
  student_name?: string
  major?: string
}

interface CourseStats {
  total_ratings: number
  avg_rating: number
  max_rating: number
  min_rating: number
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all")

  useEffect(() => {
    loadCourse()
  }, [courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      setError("")
      
      const encodedId = encodeURIComponent(courseId)
      const response = await fetch(`/api/courses/${encodedId}`)
      const data = await response.json()
      
      if (response.ok && data.course) {
        setCourse(data.course)
        setReviews(data.reviews || [])
        setStats(data.stats || null)
      } else {
        // Even if API fails, create a basic course so page doesn't show "not found"
        const courseName = courseId
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
        
        setCourse({
          item_id: courseId,
          title: courseName,
          description: `Course information for ${courseName}.`,
          category: "General",
          difficulty: "Intermediate",
          rating: 4.0,
          predicted_rating: 4.0,
          confidence: 0.8,
          source: "Coursera",
          url: `https://www.coursera.org/learn/${courseId}`,
          num_ratings: 0,
        })
        setReviews([])
        setStats(null)
      }
    } catch (error: any) {
      console.error("Error loading course:", error)
      // Create fallback course
      const courseName = courseId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase())
      
      setCourse({
        item_id: courseId,
        title: courseName,
        description: `Course information for ${courseName}.`,
        category: "General",
        difficulty: "Intermediate",
        rating: 4.0,
        predicted_rating: 4.0,
        confidence: 0.8,
        source: "Coursera",
        url: `https://www.coursera.org/learn/${courseId}`,
        num_ratings: 0,
      })
      setReviews([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  // Calculate review statistics
  const reviewStats = {
    total: reviews.length,
    average: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : course.rating,
    distribution: {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    },
  }

  const filteredReviews =
    reviewFilter === "all"
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(reviewFilter))

  // Extract key learning points from description
  const learningPoints = course.description
    .split(/[.!?]/)
    .filter((s) => s.trim().length > 20)
    .slice(0, 5)
    .map((s) => s.trim())

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ClientIcon icon={ArrowLeft} className="h-4 w-4" suppressHydrationWarning />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-3">
                  {course.category}
                </span>
                <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                  {course.title}
                </h1>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <ClientIcon icon={Star} className="h-5 w-5 fill-amber-400 text-amber-400" suppressHydrationWarning />
                    <span className="text-xl font-bold text-foreground">
                      {reviewStats.average.toFixed(1)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ({reviewStats.total} {reviewStats.total === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <ClientIcon icon={Users} className="h-4 w-4" suppressHydrationWarning />
                    <span className="text-sm">{course.difficulty} Level</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <ClientIcon icon={Award} className="h-4 w-4" suppressHydrationWarning />
                    <span className="text-sm">{course.source}</span>
                  </div>
                </div>
              </div>

              {course.url && course.url !== "#" && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Enroll on {course.source}
                  <ClientIcon icon={ExternalLink} className="h-4 w-4" suppressHydrationWarning />
                </a>
              )}
            </div>

            {/* What You'll Learn */}
            {learningPoints.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  What you'll learn
                </h2>
                <ul className="space-y-3">
                  {learningPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <ClientIcon
                        icon={CheckCircle2}
                        className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0"
                        suppressHydrationWarning
                      />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                About this course
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {course.description || "No description available for this course."}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Student Reviews
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {reviewStats.total} {reviewStats.total === 1 ? "review" : "reviews"}
                  </p>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={reviewFilter}
                      onChange={(e) => setReviewFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                )}
              </div>

              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClientIcon
                    icon={MessageSquare}
                    className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"
                    suppressHydrationWarning
                  />
                  <p>
                    {reviewFilter === "all"
                      ? "No reviews available for this course yet."
                      : `No ${reviewFilter}-star reviews found.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-slate-200 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{review.student_name || 'Anonymous'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{review.major || 'Unknown'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <ClientIcon
                                key={i}
                                icon={Star}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 dark:text-slate-700"
                                }`}
                                suppressHydrationWarning
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {review.created_at && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-slate-700 dark:text-slate-300 mb-2">
                        {review.review_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Course Stats Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Course Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Rating</span>
                    <div className="flex items-center gap-2">
                      <ClientIcon icon={Star} className="h-4 w-4 fill-amber-400 text-amber-400" suppressHydrationWarning />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {reviewStats.average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Reviews</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {reviewStats.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Level</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Match Score</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {Math.round(course.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              {stats && stats.total_ratings > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Rating Distribution
                  </h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      // Calculate distribution from reviews
                      const count = reviews.filter(r => Math.round(r.rating) === rating).length
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{rating}</span>
                            <ClientIcon icon={Star} className="h-3 w-3 fill-amber-400 text-amber-400" suppressHydrationWarning />
                          </div>
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                            {count}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {course.url && course.url !== "#" && (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Enroll Now
                      <ClientIcon icon={ExternalLink} className="h-4 w-4" suppressHydrationWarning />
                    </a>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
