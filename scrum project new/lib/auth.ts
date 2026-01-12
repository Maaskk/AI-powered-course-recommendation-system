import { cookies } from "next/headers"
import { getDatabase } from "./db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

export interface AuthUser {
  id: number
  user_id: string
  email: string
  name: string
  major?: string
  year?: number
  onboarded?: boolean | number
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  expires_at: string
}

// Initialize auth tables
export function initializeAuthTables() {
  const db = getDatabase()
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      major TEXT,
      year INTEGER,
      interests TEXT,
      academicPerformance REAL,
      onboarded INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `)
  
  // Add missing columns to existing tables (migration)
  try {
    db.exec(`
      ALTER TABLE users ADD COLUMN interests TEXT;
    `)
  } catch (e) {
    // Column might already exist
  }
  
  try {
    db.exec(`
      ALTER TABLE users ADD COLUMN academicPerformance REAL;
    `)
  } catch (e) {
    // Column might already exist
  }
}

// Session management
export async function createSession(userId: string): Promise<string> {
  const db = getDatabase()
  const sessionId = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(
    sessionId,
    userId,
    expiresAt.toISOString(),
  )

  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return sessionId
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) return null

  const db = getDatabase()

  // Get session and check expiry
  const session = db
    .prepare(`
    SELECT s.user_id, u.* 
    FROM sessions s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `)
    .get(sessionId) as AuthUser | undefined

  if (!session) {
    await clearSession()
    return null
  }

  return session
}

export async function clearSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    const db = getDatabase()
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId)
  }

  cookieStore.delete("session")
}

// User operations
export async function registerUser(
  email: string,
  password: string,
  name: string,
  major?: string,
  year?: number,
): Promise<AuthUser> {
  const db = getDatabase()

  // Check if user exists
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
  if (existing) {
    throw new Error("Email already registered")
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Generate user_id
  const userId = `U${Date.now()}-${randomBytes(4).toString("hex")}`

  // Create user
  const result = db
    .prepare(`
    INSERT INTO users (user_id, email, password_hash, name, major, year)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
    .run(userId, email, passwordHash, name, major || null, year || null)

  return {
    id: Number(result.lastInsertRowid),
    user_id: userId,
    email,
    name,
    major,
    year,
    created_at: new Date().toISOString(),
  }
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const db = getDatabase()

  const user = db
    .prepare(`
    SELECT * FROM users WHERE email = ?
  `)
    .get(email) as any

  if (!user) {
    throw new Error("Invalid email or password")
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw new Error("Invalid email or password")
  }

  return {
    id: user.id,
    user_id: user.user_id,
    email: user.email,
    name: user.name,
    major: user.major,
    year: user.year,
    onboarded: user.onboarded,
    interests: user.interests || "",
    gpa: user.academicPerformance || user.gpa,
    academicPerformance: user.academicPerformance || user.gpa,
    created_at: user.created_at,
  }
}

export async function updateUserProfile(
  userId: string,
  updates: { 
    name?: string
    major?: string
    year?: number
    onboarded?: boolean
    interests?: string
    gpa?: number
    academicPerformance?: number
  },
) {
  const db = getDatabase()

  // First, ensure the columns exist
  try {
    db.exec(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS academicPerformance REAL;
    `)
  } catch (e) {
    // Columns might already exist
  }

  const fields: string[] = []
  const values: any[] = []

  if (updates.name) {
    fields.push("name = ?")
    values.push(updates.name)
  }
  if (updates.major) {
    fields.push("major = ?")
    values.push(updates.major)
  }
  if (updates.year) {
    fields.push("year = ?")
    values.push(updates.year)
  }
  if (updates.interests !== undefined) {
    fields.push("interests = ?")
    values.push(updates.interests)
  }
  if (updates.gpa !== undefined) {
    fields.push("academicPerformance = ?")
    values.push(updates.gpa)
  }
  if (updates.academicPerformance !== undefined) {
    fields.push("academicPerformance = ?")
    values.push(updates.academicPerformance)
  }
  if (updates.onboarded !== undefined) {
    fields.push("onboarded = ?")
    values.push(updates.onboarded ? 1 : 0)
  }

  if (fields.length === 0) return

  values.push(userId)

  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`).run(...values)
}

// Initialize tables on import
initializeAuthTables()
