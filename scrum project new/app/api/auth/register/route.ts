import { type NextRequest, NextResponse } from "next/server"
import { registerUser, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, major, year } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    const user = await registerUser(email, password, name, major, year)
    await createSession(user.user_id)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[API Register Error]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 }
    )
  }
}
