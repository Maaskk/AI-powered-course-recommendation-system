import { type NextRequest, NextResponse } from "next/server"
import { mlClient } from "@/lib/ml-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const topN = Number.parseInt(searchParams.get("top_n") || "20")

    const response = await mlClient.getPopularItems(topN)

    return NextResponse.json({
      items: response.items,
      count: response.count,
    })
  } catch (error: any) {
    console.error("Error fetching popular items:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch popular items" }, { status: 500 })
  }
}
