import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id

    // Load reviews from CSV file
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

    let filePath = null
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p
        break
      }
    }

    if (!filePath) {
      return NextResponse.json({ reviews: [] })
    }

    // Read CSV file
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const lines = fileContent.split("\n")
    const headers = lines[0].split(",")

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
      return NextResponse.json({ reviews: [] })
    }

    const reviews: any[] = []

    for (let i = 1; i < lines.length && reviews.length < 100; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Better CSV parsing (handle quoted fields with commas)
      const values: string[] = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          if (j + 1 < line.length && line[j + 1] === '"') {
            // Escaped quote
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

      // Match course ID (handle variations)
      const lineCourseId = values[courseIdIndex]?.trim().toLowerCase()
      const searchCourseId = courseId.toString().toLowerCase()
      
      if (lineCourseId && (lineCourseId === searchCourseId || lineCourseId.includes(searchCourseId) || searchCourseId.includes(lineCourseId))) {
        const reviewText = (values[reviewIndex] || "").trim()
        const rating = Math.max(1, Math.min(5, parseFloat(values[labelIndex] || "4") || 4))
        
        // Only add reviews with actual text
        if (reviewText.length > 0) {
          reviews.push({
            review_id: `review_${i}_${Date.now()}`,
            course_id: values[courseIdIndex],
            review_text: reviewText,
            rating: rating,
            label: Math.round(rating),
          })
        }
      }
    }

    // Sort by rating (highest first) then by review length
    reviews.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.review_text.length - a.review_text.length
    })

    return NextResponse.json({ reviews })
  } catch (error: any) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ reviews: [] })
  }
}
