import { type NextRequest, NextResponse } from "next/server"
import { saveRecommendations, getRecommendations } from "@/lib/db"
import { getDatabase } from "@/lib/db"

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, top_n = 10 } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    // Get user profile from database
    const db = getDatabase()
    const user = db
      .prepare("SELECT user_id, major, year, interests, academicPerformance as gpa FROM users WHERE user_id = ?")
      .get(user_id) as any

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.major) {
      return NextResponse.json(
        { error: "Please complete your profile first. Major is required." },
        { status: 400 }
      )
    }

    // Call ML API with user profile
    const mlResponse = await fetch(`${ML_API_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        major: user.major,
        interests: user.interests || "",
        year: user.year || 2,
        gpa: user.gpa || 3.0,
        top_n: top_n,
      }),
    })

    if (!mlResponse.ok) {
      const errorData = await mlResponse.json().catch(() => ({}))
      throw new Error(errorData.error || `ML API error: ${mlResponse.statusText}`)
    }

    const mlData = await mlResponse.json()

    // Save to database if recommendations exist
    if (mlData.recommendations && mlData.recommendations.length > 0) {
      saveRecommendations(user_id, mlData.recommendations)
    }

    return NextResponse.json({
      user_id,
      recommendations: mlData.recommendations || [],
      count: mlData.count || 0,
    })
  } catch (error: any) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const recommendations = getRecommendations(userId, limit)
    return NextResponse.json({ recommendations, count: recommendations.length })
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}
