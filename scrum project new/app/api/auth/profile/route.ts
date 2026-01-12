import { type NextRequest, NextResponse } from "next/server"
import { getSession, updateUserProfile } from "@/lib/auth"

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    await updateUserProfile(user.user_id, body)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Update profile error:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
