import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    const db = getDatabase()
    const result = db.prepare("SELECT 1 as test").get() as { test: number }
    
    return NextResponse.json({
      status: "ok",
      database: result.test === 1 ? "connected" : "error",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("[API Health Error]", error)
    return NextResponse.json(
      { 
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
