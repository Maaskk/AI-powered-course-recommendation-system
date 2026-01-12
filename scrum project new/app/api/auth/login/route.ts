import { type NextRequest, NextResponse } from "next/server"
import { loginUser, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await loginUser(email, password)
    await createSession(user.user_id)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[API Login Error]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 401 }
    )
  }
}
