import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"
import fs from "fs"
import path from "path"

// Cache for course data loaded from CSV
let courseCache: Map<string, any> | null = null

function loadCoursesFromReviews(): Map<string, any> {
  if (courseCache) {
    return courseCache
  }

  courseCache = new Map()
  
  // Try multiple paths for reviews CSV
  const possiblePaths = [
    path.join(
      process.cwd(),
      "data",
      "100K Coursera's Course Reviews Dataset by Jan Charles ",
      "reviews_by_course.csv"
    ),
    path.join(
      process.cwd(),
      "data",
      "100K Coursera's Course Reviews Dataset by Jan Charles",
      "reviews_by_course.csv"
    ),
    path.join(process.cwd(), "data", "coursera", "coursera_reviews.csv"),
  ]

  let filePath: string | null = null
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p
      break
    }
  }

  if (!filePath) {
    return courseCache
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const lines = fileContent.split("\n").filter((line) => line.trim())
    
    if (lines.length === 0) {
      return courseCache
    }

    const headers = lines[0].split(",").map((h) => h.trim())
    const courseIdIndex = headers.findIndex(
      (h) => h.toLowerCase() === "courseid" || h.toLowerCase() === "course_id"
    )
    const reviewIndex = headers.findIndex(
      (h) => h.toLowerCase() === "review" || h.toLowerCase() === "review_text"
    )
    const labelIndex = headers.findIndex(
      (h) => h.toLowerCase() === "label" || h.toLowerCase() === "rating"
    )

    if (courseIdIndex === -1) {
      return courseCache
    }

    // Group reviews by course
    const courseData: Map<string, any> = new Map()

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Parse CSV line (handle quoted fields)
      const values: string[] = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          if (j + 1 < line.length && line[j + 1] === '"') {
            current += '"'
            j++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())

      if (values.length <= courseIdIndex) continue

      const courseId = values[courseIdIndex]?.trim()
      if (!courseId) continue

      const reviewText = values[reviewIndex] || ""
      const rating = parseFloat(values[labelIndex] || "4")

      if (!courseData.has(courseId)) {
        courseData.set(courseId, {
          course_id: courseId,
          item_id: courseId,
          reviews: [],
          ratings: [],
        })
      }

      const course = courseData.get(courseId)!
      if (reviewText) {
        course.reviews.push(reviewText)
      }
      if (!isNaN(rating)) {
        course.ratings.push(rating)
      }
    }

    // Process each course to extract metadata
    for (const [courseId, data] of courseData.entries()) {
      const allReviews = data.reviews.join(" ").toLowerCase()
      const avgRating =
        data.ratings.length > 0
          ? data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length
          : 4.0

      // Extract course name from course ID
      const courseName = courseId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase())

      // Extract description from reviews
      const meaningfulReviews = data.reviews
        .filter((r: string) => r.length > 20)
        .slice(0, 3)
      const description = meaningfulReviews.length > 0
        ? meaningfulReviews.join(" ")
        : `A comprehensive course on ${courseName}. Students have provided positive feedback about the course content and structure.`

      // Determine category
      let category = "General"
      const categoryKeywords: Record<string, string[]> = {
        "Computer Science": ["programming", "code", "software", "algorithm", "python", "java", "web"],
        "Data Science": ["data", "analysis", "machine learning", "statistics", "analytics"],
        "Business": ["business", "management", "marketing", "finance", "entrepreneurship"],
        "Engineering": ["engineering", "design", "mechanical", "electrical", "system"],
        "Health": ["health", "medical", "medicine", "nursing", "biology"],
        "Science": ["science", "physics", "chemistry", "biology", "research"],
      }

      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (
          keywords.some((kw) =>
            courseName.toLowerCase().includes(kw) || allReviews.includes(kw)
          )
        ) {
          category = cat
          break
        }
      }

      // Determine difficulty
      let difficulty = "Intermediate"
      if (avgRating < 3.0) {
        difficulty = "Advanced"
      } else if (avgRating > 4.5) {
        difficulty = "Beginner"
      }

      courseCache.set(courseId, {
        course_id: courseId,
        item_id: courseId,
        title: courseName,
        description: description.substring(0, 500) + (description.length > 500 ? "..." : ""),
        category,
        difficulty,
        rating: Math.round(avgRating * 10) / 10,
        num_ratings: data.reviews.length,
        source: "Coursera",
        url: `https://www.coursera.org/learn/${courseId}`,
      })
    }
  } catch (error) {
    console.error("Error loading courses from reviews:", error)
  }

  return courseCache
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = decodeURIComponent(params.id).trim()
    
    // Load CSV cache first
    const csvCourses = loadCoursesFromReviews()
    
    // Try exact match in CSV
    let course = csvCourses.get(courseId)
    
    // Try case-insensitive match
    if (!course) {
      for (const [id, data] of csvCourses.entries()) {
        if (id.toLowerCase() === courseId.toLowerCase()) {
          course = data
          break
        }
      }
    }
    
    // Try database
    if (!course) {
      const db = getDatabase()
      const dbCourse = db
        .prepare("SELECT * FROM recommendations WHERE item_id = ? OR course_id = ? LIMIT 1")
        .get(courseId, courseId) as any
      
      if (dbCourse) {
        course = {
          item_id: dbCourse.item_id || dbCourse.course_id || courseId,
          course_id: dbCourse.course_id || dbCourse.item_id || courseId,
          title: dbCourse.title,
          description: dbCourse.description || "",
          category: dbCourse.category || "General",
          difficulty: dbCourse.difficulty || "Intermediate",
          rating: dbCourse.avg_rating || dbCourse.rating || 4.0,
          predicted_rating: dbCourse.predicted_rating || 4.0,
          confidence: dbCourse.confidence || 0.8,
          source: dbCourse.source || "Coursera",
          url: dbCourse.url || `https://www.coursera.org/learn/${courseId}`,
          num_ratings: dbCourse.num_ratings || 0,
        }
      }
    }
    
    // If still not found, create a basic course from the ID
    if (!course) {
      const courseName = courseId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase())
      
      course = {
        item_id: courseId,
        course_id: courseId,
        title: courseName,
        description: `This is a course on ${courseName}. Course details are being loaded.`,
        category: "General",
        difficulty: "Intermediate",
        rating: 4.0,
        predicted_rating: 4.0,
        confidence: 0.8,
        source: "Coursera",
        url: `https://www.coursera.org/learn/${courseId}`,
        num_ratings: 0,
      }
    }

    // Get reviews from CSV
    const reviews: any[] = []
    try {
      const possiblePaths = [
        path.join(
          process.cwd(),
          "data",
          "100K Coursera's Course Reviews Dataset by Jan Charles ",
          "reviews_by_course.csv"
        ),
        path.join(
          process.cwd(),
          "data",
          "100K Coursera's Course Reviews Dataset by Jan Charles",
          "reviews_by_course.csv"
        ),
      ]

      let filePath: string | null = null
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          filePath = p
          break
        }
      }

      if (filePath) {
        const fileContent = fs.readFileSync(filePath, "utf-8")
        const lines = fileContent.split("\n").filter((line) => line.trim())
        
        if (lines.length > 0) {
          const headers = lines[0].split(",").map((h) => h.trim())
          const courseIdIndex = headers.findIndex(
            (h) => h.toLowerCase() === "courseid" || h.toLowerCase() === "course_id"
          )
          const reviewIndex = headers.findIndex(
            (h) => h.toLowerCase() === "review" || h.toLowerCase() === "review_text"
          )
          const labelIndex = headers.findIndex(
            (h) => h.toLowerCase() === "label" || h.toLowerCase() === "rating"
          )

          if (courseIdIndex !== -1) {
            for (let i = 1; i < lines.length && reviews.length < 50; i++) {
              const line = lines[i]
              if (!line.trim()) continue

              const values: string[] = []
              let current = ""
              let inQuotes = false

              for (let j = 0; j < line.length; j++) {
                const char = line[j]
                if (char === '"') {
                  if (j + 1 < line.length && line[j + 1] === '"') {
                    current += '"'
                    j++
                  } else {
                    inQuotes = !inQuotes
                  }
                } else if (char === "," && !inQuotes) {
                  values.push(current.trim())
                  current = ""
                } else {
                  current += char
                }
              }
              values.push(current.trim())

              if (values.length > courseIdIndex) {
                const id = values[courseIdIndex]?.trim()
                if (id && (id.toLowerCase() === courseId.toLowerCase() || 
                          id.toLowerCase().includes(courseId.toLowerCase()) ||
                          courseId.toLowerCase().includes(id.toLowerCase()))) {
                  const reviewText = values[reviewIndex] || ""
                  const rating = parseFloat(values[labelIndex] || "4")
                  
                  if (reviewText) {
                    reviews.push({
                      rating: Math.max(1, Math.min(5, rating)),
                      created_at: new Date().toISOString(),
                      student_name: "Student",
                      major: "Unknown",
                      review_text: reviewText,
                    })
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error loading reviews:", e)
    }

    // Get stats from database
    const db = getDatabase()
    const stats = db
      .prepare(`
        SELECT 
          COUNT(*) as total_ratings,
          AVG(rating) as avg_rating,
          MAX(rating) as max_rating,
          MIN(rating) as min_rating
        FROM user_ratings
        WHERE item_id = ?
      `)
      .get(course.item_id || course.course_id || courseId) as any

    return NextResponse.json({
      course: {
        item_id: course.item_id || course.course_id || courseId,
        course_id: course.course_id || course.item_id || courseId,
        title: course.title,
        description: course.description || "",
        category: course.category || "General",
        difficulty: course.difficulty || "Intermediate",
        rating: course.avg_rating || course.rating || 4.0,
        predicted_rating: course.predicted_rating || 4.0,
        confidence: course.confidence || 0.8,
        source: course.source || "Coursera",
        url: course.url || `https://www.coursera.org/learn/${courseId}`,
        num_ratings: course.num_ratings || reviews.length || 0,
      },
      reviews: reviews,
      stats: {
        total_ratings: stats?.total_ratings || reviews.length || 0,
        avg_rating: stats?.avg_rating || course.rating || 4.0,
        max_rating: stats?.max_rating || 5.0,
        min_rating: stats?.min_rating || 1.0,
      },
    })
  } catch (error: any) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
