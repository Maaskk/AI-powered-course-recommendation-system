import { type NextRequest, NextResponse } from "next/server"
import { createStudent, getAllStudents } from "@/lib/db"

export async function GET() {
  try {
    const students = getAllStudents()
    return NextResponse.json({ students, count: students.length })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, name, email, major, year } = body

    if (!user_id || !name) {
      return NextResponse.json({ error: "user_id and name are required" }, { status: 400 })
    }

    const student = createStudent({ user_id, name, email, major, year })
    return NextResponse.json({ student }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating student:", error)

    if (error.message?.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Student with this user_id already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
