import { type NextRequest, NextResponse } from "next/server"
import { saveRating, getUserRatings } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, item_id, rating } = body

    if (!user_id || !item_id || rating === undefined) {
      return NextResponse.json({ error: "user_id, item_id, and rating are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    saveRating({ user_id, item_id, rating })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving rating:", error)
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const ratings = getUserRatings(userId)
    return NextResponse.json({ ratings, count: ratings.length })
  } catch (error) {
    console.error("Error fetching ratings:", error)
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
  }
}
